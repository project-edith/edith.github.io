#!/usr/bin/env python3
"""
Add a black top bar to a talk video and burn one-line captions into that bar.

Pipeline:
  1. Transcribe audio with faster-whisper (word-level timestamps).  Cached to a
     sidecar JSON so layout / transcript tweaks re-run without re-transcribing.
  2. (Optional) If --transcript is given, align that ground-truth text to the ASR
     word timings and use the ground-truth words.  This fixes proper-noun errors
     (e.g. "Edith" mis-heard as "ITIS") while keeping ASR timing.
  3. Group words into short single-line cues.
  4. ffmpeg: pad a black bar on top (so the slide is NOT covered) and draw the
     active cue inside the bar with drawtext (this ffmpeg has no libass).

Usage:
  python make_captioned_video.py
  python make_captioned_video.py --transcript transcript.txt
  python make_captioned_video.py --bar-height 110 --font-size 32

Requires: faster-whisper, ffmpeg with drawtext (libfreetype).
"""

import argparse
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_INPUT = os.path.join(HERE, "edith_5min_presentation_final.mp4")
DEFAULT_OUTPUT = os.path.join(HERE, "edith_5min_presentation_final_captioned.mp4")
DEFAULT_FONT = "/Library/Fonts/Arial Unicode.ttf"          # Latin + Korean glyphs
FALLBACK_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"


def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--input", default=DEFAULT_INPUT)
    p.add_argument("--output", default=DEFAULT_OUTPUT)
    p.add_argument("--transcript", default=None,
                   help="ground-truth transcript .txt to correct ASR text")
    p.add_argument("--model", default="small",
                   help="faster-whisper model size (tiny/base/small/medium/large-v3)")
    p.add_argument("--language", default=None, help="force language code (en, ko)")
    p.add_argument("--no-cache", action="store_true", help="ignore ASR cache")
    p.add_argument("--font", default=DEFAULT_FONT)
    p.add_argument("--font-size", type=int, default=26)
    p.add_argument("--bar-height", type=int, default=100,
                   help="height in px of the black caption bar added on top")
    p.add_argument("--max-chars", type=int, default=100000,
                   help="max chars per cue (huge = group by sentence only)")
    p.add_argument("--max-gap", type=float, default=999.0,
                   help="silence (s) that forces a new cue (huge = sentence only)")
    p.add_argument("--wrap-chars", type=int, default=90,
                   help="wrap a sentence onto a new line past this many chars")
    p.add_argument("--crf", type=int, default=23)
    return p.parse_args()


# proper-noun / term fixes applied to caption text (ASR mishears the project name)
def apply_corrections(text):
    text = re.sub(r"(\w)\s+-(\w)", r"\1-\2", text)         # "non -verbal" -> "non-verbal"
    text = re.sub(r"\bitis\b", "EDITH", text, flags=re.IGNORECASE)
    text = re.sub(r"\bIt\b", "EDITH", text)               # capitalized "It" only
    text = re.sub(r"(?i)\bself\s*-?\s*task(s?)\b", r"subtask\1", text)
    return text


def wrap_text(text, wrap_chars):
    """Greedy word-wrap so each line stays within wrap_chars."""
    words, lines, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > wrap_chars:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    return "\n".join(lines)


# --------------------------------------------------------------------------- ASR
def cache_path(input_path, model_size):
    st = os.stat(input_path)
    return f"{input_path}.asr-{model_size}-{int(st.st_mtime)}-{st.st_size}.json"


def transcribe(input_path, model_size, language, use_cache):
    cpath = cache_path(input_path, model_size)
    if use_cache and os.path.exists(cpath):
        with open(cpath, encoding="utf-8") as fh:
            data = json.load(fh)
        print(f"[asr] loaded cached transcript ({len(data['words'])} words)", flush=True)
        return [tuple(w) for w in data["words"]]

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("faster-whisper not installed:  python -m pip install faster-whisper")

    print(f"[asr] loading model '{model_size}' (CPU, int8) ...", flush=True)
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    print("[asr] transcribing (a few minutes) ...", flush=True)
    segments, info = model.transcribe(input_path, language=language,
                                      word_timestamps=True, vad_filter=True,
                                      beam_size=5)
    print(f"[asr] language={info.language} (p={info.language_probability:.2f})",
          flush=True)

    words = []
    for seg in segments:
        for w in (seg.words or []):
            tok = (w.word or "").strip()
            if tok:
                words.append((tok, float(w.start), float(w.end)))
    print(f"[asr] {len(words)} words", flush=True)

    with open(cpath, "w", encoding="utf-8") as fh:
        json.dump({"language": info.language, "words": words}, fh)
    return words


# ----------------------------------------------------------------- transcript fix
def _norm(t):
    return re.sub(r"[^0-9a-z]+", "", t.lower())


def align_reference(asr_words, ref_text):
    """Map ground-truth transcript words onto ASR word timings."""
    ref_tokens = ref_text.split()
    a = [_norm(w[0]) for w in asr_words]
    b = [_norm(t) for t in ref_tokens]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    out = []  # [token, start, end]

    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                _, s, e = asr_words[i1 + k]
                out.append([ref_tokens[j1 + k], s, e])
        elif tag == "delete":
            continue  # ASR-only words (noise) -> drop
        else:  # replace / insert : spread ref words over the time window
            block = ref_tokens[j1:j2]
            if not block:
                continue
            if i2 > i1:
                t0, t1 = asr_words[i1][1], asr_words[i2 - 1][2]
            else:  # pure insert: sit between neighbours
                t0 = out[-1][2] if out else 0.0
                t1 = asr_words[i1][1] if i1 < len(asr_words) else t0 + 0.4 * len(block)
            span = max(t1 - t0, 0.2)
            n = len(block)
            for k, rt in enumerate(block):
                out.append([rt, t0 + span * k / n, t0 + span * (k + 1) / n])

    for w in out:
        if w[2] <= w[1]:
            w[2] = w[1] + 0.15
    print(f"[fix] aligned {len(ref_tokens)} transcript words "
          f"({sum(1 for o in sm.get_opcodes() if o[0]!='equal')} edit blocks)", flush=True)
    return [tuple(w) for w in out]


# ---------------------------------------------------------------------- cue build
def build_cues(words, max_chars, max_gap):
    cues, cur, text = [], [], ""

    def flush():
        nonlocal cur, text
        if cur:
            cues.append({"text": apply_corrections(re.sub(r"\s+", " ", text).strip()),
                         "start": cur[0][1], "end": cur[-1][2]})
        cur, text = [], ""

    for tok, start, end in words:
        if cur:
            gap = start - cur[-1][2]
            if gap > max_gap or len((text + " " + tok).strip()) > max_chars:
                flush()
        cur.append((tok, start, end))
        text = (text + " " + tok).strip()
        if tok[-1] in ".?!,;:" and len(text) >= 12:
            flush()
    flush()

    for i, c in enumerate(cues):
        nxt = cues[i + 1]["start"] if i + 1 < len(cues) else c["end"] + 1.0
        c["end"] = min(max(c["end"], c["start"] + 0.6), nxt - 0.02)
    return cues


def build_filtergraph(cues, tmp_dir, font, font_size, bar, wrap_chars):
    parts = []
    for i, c in enumerate(cues):
        tf = os.path.join(tmp_dir, f"cue_{i:04d}.txt")
        with open(tf, "w", encoding="utf-8") as fh:
            fh.write(wrap_text(c["text"], wrap_chars))
        parts.append(
            "drawtext="
            f"fontfile='{font}':textfile='{tf}':expansion=none:"
            f"fontcolor=white:fontsize={font_size}:"
            f"x=(w-text_w)/2:y=({bar}-text_h)/2:"
            f"enable='between(t,{c['start']:.2f},{c['end']:.2f})'"
        )
    # pad a black bar on top, then draw the captions inside it
    return f"[0:v]pad=iw:ih+{bar}:0:{bar}:color=black,{','.join(parts)}[v]"


def main():
    args = parse_args()
    if not os.path.exists(args.input):
        sys.exit(f"input not found: {args.input}")
    font = args.font if os.path.exists(args.font) else FALLBACK_FONT
    if not os.path.exists(font):
        sys.exit("no usable font found")
    bar = args.bar_height + (args.bar_height % 2)  # keep frame height even

    words = transcribe(args.input, args.model, args.language, not args.no_cache)
    if not words:
        sys.exit("ASR produced no words")

    if args.transcript:
        with open(args.transcript, encoding="utf-8") as fh:
            ref = fh.read()
        words = align_reference(words, ref)

    cues = build_cues(words, args.max_chars, args.max_gap)
    print(f"[cap] {len(cues)} one-line cues, bar={bar}px", flush=True)

    tmp_dir = tempfile.mkdtemp(prefix="edith_caps_")
    try:
        graph = build_filtergraph(cues, tmp_dir, font, args.font_size, bar,
                                  args.wrap_chars)
        graph_path = os.path.join(tmp_dir, "filter.txt")
        with open(graph_path, "w", encoding="utf-8") as fh:
            fh.write(graph)
        cmd = ["ffmpeg", "-y", "-i", args.input,
               "-filter_complex_script", graph_path,
               "-map", "[v]", "-map", "0:a?",
               "-c:v", "libx264", "-preset", "medium", "-crf", str(args.crf),
               "-pix_fmt", "yuv420p", "-movflags", "+faststart",
               "-c:a", "copy", args.output]
        print("[ffmpeg] padding + burning captions ...", flush=True)
        subprocess.run(cmd, check=True)
        print(f"[done] wrote {args.output}", flush=True)
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
