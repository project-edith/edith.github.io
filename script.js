document.documentElement.classList.add("js-enabled");

const year = document.querySelector("#year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${visible.target.id}`,
        );
      });
    },
    {
      rootMargin: "-25% 0px -60% 0px",
      threshold: [0.1, 0.3, 0.6],
    },
  );

  sections.forEach((section) => observer.observe(section));
}

const animatedElements = Array.from(document.querySelectorAll("[data-animate]"));
if ("IntersectionObserver" in window && animatedElements.length) {
  const revealVisibleAnimatedElements = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    animatedElements.forEach((element) => {
      if (element.classList.contains("is-visible")) return;

      const rect = element.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * 0.08) {
        element.classList.add("is-visible");
      }
    });
  };

  let revealAttempts = 0;
  let revealTimer = 0;
  const revealVisibleAnimatedElementsSoon = () => {
    revealVisibleAnimatedElements();
    revealAttempts += 1;

    if (revealAttempts < 24) {
      revealTimer = window.setTimeout(revealVisibleAnimatedElementsSoon, 100);
    } else {
      revealTimer = 0;
    }
  };

  const scheduleAnimatedElementReveal = () => {
    revealAttempts = 0;
    if (revealTimer) window.clearTimeout(revealTimer);
    requestAnimationFrame(revealVisibleAnimatedElementsSoon);
  };

  const animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        animationObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.18,
    },
  );

  animatedElements.forEach((element) => animationObserver.observe(element));
  scheduleAnimatedElementReveal();
  window.addEventListener(
    "scroll",
    scheduleAnimatedElementReveal,
    { passive: true },
  );
  window.addEventListener("resize", revealVisibleAnimatedElements);
} else {
  animatedElements.forEach((element) => element.classList.add("is-visible"));
}

const demos = {
  muffin: {
    kicker: "Demo 01",
    title: "Muffin-serving interaction",
    description:
      "The viewer first shows the text-only interaction, then plays the EDITH rollout grounded in egocentric human signals.",
    poster: "assets/posters/muffin-text.jpg",
    playlist: [
      {
        src: "assets/videos/muffin_text.mp4",
        poster: "assets/posters/muffin-text.jpg",
      },
      {
        src: "assets/videos/muffin_edith.mp4",
        poster: "assets/posters/muffin-edith.jpg",
      },
    ],
    trace: [
      "Play the language-only request segment first.",
      "Continue into the EDITH segment with egocentric grounding.",
      "Compare how gaze and gestures disambiguate visually similar muffins.",
    ],
  },
  tool: {
    kicker: "Demo 02",
    title: "Tool-passing interaction",
    description:
      "The tool-passing demo first shows a text-only request, then the EDITH rollout where gaze resolves the intended tool.",
    poster: "assets/posters/passing-tool-text.jpg",
    playlist: [
      {
        src: "assets/videos/passing_tool_text.mp4",
        poster: "assets/posters/passing-tool-text.jpg",
      },
      {
        src: "assets/videos/edith_passing_tool.mp4",
        poster: "assets/posters/passing-tool-edith.jpg",
      },
    ],
    trace: [
      "Play the language-only tool request first.",
      "Continue into the EDITH rollout with egocentric grounding.",
      "Use gaze to identify the intended tool among similar candidates.",
    ],
  },
  tumbler: {
    kicker: "Demo 03",
    title: "Tumbler-sorting interaction",
    description:
      "The tumbler demo first shows the text-only instruction, then the EDITH rollout with egocentric context and nonverbal grounding.",
    poster: "assets/posters/tumbler-text.jpg",
    playlist: [
      {
        src: "assets/videos/tumbler_text.mp4",
        poster: "assets/posters/tumbler-text.jpg",
      },
      {
        src: "assets/videos/tumbler_edith.mp4",
        poster: "assets/posters/tumbler-edith.jpg",
      },
    ],
    trace: [
      "Play the language-only sorting instruction first.",
      "Continue into the EDITH rollout with gaze and gesture grounding.",
      "Execute the grounded subtask sequence through the low-level policy.",
    ],
  },
};

const demoVideo = document.querySelector("#demo-video");
const demoKicker = document.querySelector("#demo-kicker");
const demoTitle = document.querySelector("#demo-title");
const demoDescription = document.querySelector("#demo-description");
const demoTrace = document.querySelector("#demo-trace");
const progressBar = document.querySelector("#video-progress-bar");
let activeDemoId = "muffin";
let activeClipIndex = 0;

function loadDemoClip(demo, clipIndex) {
  const clip = demo.playlist?.[clipIndex];
  if (!clip || !demoVideo) return;

  demoVideo.pause();
  demoVideo.poster = clip.poster || demo.poster;
  const source = demoVideo.querySelector("source");
  if (source) {
    source.src = clip.src;
  }
  if (progressBar) progressBar.style.width = "0%";
  demoVideo.load();
  demoVideo.play().catch(() => {});
}

function setDemo(id) {
  const demo = demos[id];
  if (!demo || !demoVideo) return;
  activeDemoId = id;
  activeClipIndex = 0;

  document.querySelectorAll("[data-demo]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.demo === id);
  });

  loadDemoClip(demo, activeClipIndex);

  if (demoKicker) demoKicker.textContent = demo.kicker;
  if (demoTitle) demoTitle.textContent = demo.title;
  if (demoDescription) demoDescription.textContent = demo.description;
  if (demoTrace) {
    demoTrace.innerHTML = "";
    demo.trace.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      demoTrace.append(li);
    });
  }
}

document.querySelectorAll("[data-demo]").forEach((element) => {
  element.addEventListener("click", () => {
    setDemo(element.dataset.demo);
    document.querySelector("#demos")?.scrollIntoView({ block: "start" });
  });
});

if (demoVideo && progressBar) {
  demoVideo.addEventListener("timeupdate", () => {
    const ratio = demoVideo.duration ? demoVideo.currentTime / demoVideo.duration : 0;
    progressBar.style.width = `${Math.min(100, ratio * 100)}%`;
  });

  demoVideo.addEventListener("ended", () => {
    const demo = demos[activeDemoId];
    if (!demo?.playlist?.length) return;

    activeClipIndex = (activeClipIndex + 1) % demo.playlist.length;
    loadDemoClip(demo, activeClipIndex);
  });
}

const methodContent = {
  signals: {
    kicker: "Hardware System",
    title: "Capturing human signals via smart glasses.",
    description:
      "EDITH streams the human's first-person view, gaze, and speech in real time, then synchronizes these human signals with robot observations.",
    points: [
      "Project Aria glasses capture first-person RGB, gaze, and speech.",
      "Speech is transcribed into language instructions.",
      "Human signals and robot observations are aligned by timestamp.",
    ],
  },
  "high-level": {
    kicker: "High-level Policy",
    title: "Inferring intent from egocentric context and language.",
    description:
      "The high-level policy πh periodically processes C^ego_{t-H:t} and language instructions ℓ_{t-H:t} to produce subtasks.",
    points: [
      "Each subtask pairs a fine-grained instruction [TASK] with a keyframe C^key.",
      "The keyframe captures the moment when the human's nonverbal signal is clearest.",
      "New subtasks are appended to the task queue Q for sequential execution.",
    ],
  },
  "low-level": {
    kicker: "Low-level Policy",
    title: "Executing queued subtasks with a VLA policy.",
    description:
      "The low-level policy πl takes the robot observation ot, [TASK], and C^key, then produces a robot action and completion probability.",
    points: [
      "Predicts at and pt for the current subtask.",
      "Moves to the next queued subtask when pt exceeds a threshold.",
      "Uses a fine-tuned VLA model with an added completion head.",
    ],
  },
};

const methodKicker = document.querySelector("#method-kicker");
const methodTitle = document.querySelector("#method-title");
const methodDescription = document.querySelector("#method-description");
const methodPoints = document.querySelector("#method-points");

function setMethod(step) {
  const content = methodContent[step];
  if (!content) return;

  document.querySelectorAll("[data-step]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.step === step);
  });

  if (methodKicker) methodKicker.textContent = content.kicker;
  if (methodTitle) methodTitle.textContent = content.title;
  if (methodDescription) methodDescription.textContent = content.description;
  if (methodPoints) {
    methodPoints.innerHTML = "";
    content.points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      methodPoints.append(li);
    });
  }
}

document.querySelectorAll(".method-tab, .method-node, .arch-policy, .arch-subtasks, .arch-context-strip, .arch-robot-observations").forEach((element) => {
  element.addEventListener("click", () => setMethod(element.dataset.step));
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.querySelector(button.dataset.copy);
    if (!target) return;

    const original = button.textContent;

    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original;
      }, 1600);
    } catch {
      button.textContent = "Copy Failed";
      setTimeout(() => {
        button.textContent = original;
      }, 1600);
    }
  });
});
