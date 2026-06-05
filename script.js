document.documentElement.classList.add("js-enabled");

const year = document.querySelector("#year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const hero = document.querySelector(".hero");
const heroScrollTarget = document.querySelector(".paper-title-block");

if (hero && heroScrollTarget) {
  let isHeroSnapping = false;
  let heroTouchStartY = 0;

  const getHeroTargetY = () => heroScrollTarget.getBoundingClientRect().top + window.scrollY;
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canSnapFromHero = (deltaY) => {
    if (deltaY <= 0 || isHeroSnapping) return false;
    const targetY = getHeroTargetY();
    return window.scrollY < targetY - 4 && hero.getBoundingClientRect().bottom > 24;
  };

  const snapFromHero = () => {
    isHeroSnapping = true;
    window.scrollTo({
      top: getHeroTargetY(),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    window.setTimeout(() => {
      isHeroSnapping = false;
    }, 850);
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (!canSnapFromHero(event.deltaY)) return;
      event.preventDefault();
      snapFromHero();
    },
    { passive: false },
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      heroTouchStartY = event.touches[0]?.clientY || 0;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      const touchY = event.touches[0]?.clientY || heroTouchStartY;
      const deltaY = heroTouchStartY - touchY;
      if (!canSnapFromHero(deltaY)) return;
      event.preventDefault();
      heroTouchStartY = touchY;
      snapFromHero();
    },
    { passive: false },
  );

  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!["ArrowDown", "PageDown", " "].includes(event.key)) return;
    if (!canSnapFromHero(1)) return;
    event.preventDefault();
    snapFromHero();
  });
}

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

const taskComparisons = [
  {
    title: "Muffin-Serving",
    text: {
      src: "assets/videos/muffin_textvla.mp4",
      poster: "assets/posters/muffin-text.jpg",
    },
    edith: {
      src: "assets/videos/muffin_edith.mp4",
      poster: "assets/posters/muffin-edith.jpg",
    },
  },
  {
    title: "Tumbler-Sorting",
    text: {
      src: "assets/videos/tumbler_text_vla.mp4",
      poster: "assets/posters/tumbler-text.jpg",
    },
    edith: {
      src: "assets/videos/tumbler_edith.mp4",
      poster: "assets/posters/tumbler-edith.jpg",
    },
  },
  {
    title: "Tool-Passing",
    text: {
      src: "assets/videos/passing_tool_textvla.mp4",
      poster: "assets/posters/passing-tool-text.jpg",
    },
    edith: {
      src: "assets/videos/edith_passing_tool.mp4",
      poster: "assets/posters/passing-tool-edith.jpg",
    },
  },
];

const taskTrack = document.querySelector("#task-slide-track");
const taskCarousel = document.querySelector(".task-carousel");
const taskCarouselViewport = document.querySelector(".task-carousel-viewport");
const taskCarouselCue = document.querySelector(".task-carousel-cue");
const taskSlides = [...document.querySelectorAll(".task-slide")];
const taskCounter = document.querySelector("#task-counter");
const taskTitle = document.querySelector("#task-title");
const taskDescription = document.querySelector("#task-description");
const taskPrev = document.querySelector("#task-prev");
const taskNext = document.querySelector("#task-next");
const taskDots = document.querySelector("#task-dots");
const evaluationTaskGrid = document.querySelector(".demo-section .task-grid");
const evaluationTaskScrollCue = document.querySelector(".task-scroll-cue");
const taskAudioToggle = document.querySelector("#task-audio-toggle");
const taskAudioLabel = taskAudioToggle?.querySelector("[data-task-audio-label]");
let activeTaskIndex = 0;
let playbackToken = 0;
let playbackRestartTimer = 0;
let taskAudioEnabled = true;
let isTaskCarouselInView = false;
let taskDragState = null;
let taskAudioPlaybackRetryQueued = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getTaskSlideStep() {
  if (!taskTrack || !taskSlides.length) return 0;

  const slideWidth = taskSlides[0].getBoundingClientRect().width;
  const trackStyle = getComputedStyle(taskTrack);
  const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "0") || 0;
  return slideWidth + gap;
}

function updateTaskCarouselCue(visualIndex = activeTaskIndex) {
  if (!taskCarouselCue || !taskSlides.length) return;

  const cueTrack = taskCarouselCue.querySelector("span");
  if (!cueTrack) return;

  const trackWidth = cueTrack.getBoundingClientRect().width;
  if (!trackWidth) return;

  const thumbWidth = Math.max(18, Math.round(trackWidth / taskSlides.length));
  const maxIndex = Math.max(1, taskSlides.length - 1);
  const progress = clamp(visualIndex / maxIndex, 0, 1);
  const thumbX = Math.round((trackWidth - thumbWidth) * progress);

  taskCarouselCue.style.setProperty("--task-carousel-thumb-width", `${thumbWidth}px`);
  taskCarouselCue.style.setProperty("--task-carousel-thumb-x", `${thumbX}px`);
}

function updateTaskTrackPosition(offset = 0) {
  if (!taskTrack || !taskSlides.length) return;
  const step = getTaskSlideStep();
  taskTrack.style.transform = `translateX(${-activeTaskIndex * step + offset}px)`;
  updateTaskCarouselCue(activeTaskIndex - (step ? offset / step : 0));
}

function updateEvaluationTaskScrollCue() {
  if (!evaluationTaskGrid || !evaluationTaskScrollCue) return;

  const cueTrack = evaluationTaskScrollCue.querySelector("span");
  if (!cueTrack) return;

  const maxScroll = evaluationTaskGrid.scrollWidth - evaluationTaskGrid.clientWidth;
  evaluationTaskScrollCue.classList.toggle("is-hidden", maxScroll <= 1);
  if (maxScroll <= 1) return;

  const trackWidth = cueTrack.getBoundingClientRect().width;
  const thumbWidth = Math.max(18, Math.round(trackWidth * (evaluationTaskGrid.clientWidth / evaluationTaskGrid.scrollWidth)));
  const progress = evaluationTaskGrid.scrollLeft / maxScroll;
  const thumbX = Math.round((trackWidth - thumbWidth) * progress);

  evaluationTaskScrollCue.style.setProperty("--task-scroll-thumb-width", `${thumbWidth}px`);
  evaluationTaskScrollCue.style.setProperty("--task-scroll-thumb-x", `${thumbX}px`);
}

const resultScrollCueSelector = [
  ".paper-result-chart",
  ".workload-bar-chart",
  ".robustness-paper-chart",
  ".likert-task",
  ".bar-chart",
].join(",");
const resultScrollCueReady = new WeakSet();

function updateResultScrollCue(scroller, cue) {
  if (!scroller || !cue) return;

  const cueTrack = cue.querySelector("span");
  if (!cueTrack) return;

  const maxScroll = scroller.scrollWidth - scroller.clientWidth;
  cue.classList.toggle("is-hidden", maxScroll <= 1);
  if (maxScroll <= 1) return;

  const trackWidth = cueTrack.getBoundingClientRect().width;
  if (!trackWidth) return;

  const thumbWidth = Math.max(18, Math.round(trackWidth * (scroller.clientWidth / scroller.scrollWidth)));
  const progress = scroller.scrollLeft / maxScroll;
  const thumbX = Math.round((trackWidth - thumbWidth) * progress);

  cue.style.setProperty("--result-scroll-thumb-width", `${thumbWidth}px`);
  cue.style.setProperty("--result-scroll-thumb-x", `${thumbX}px`);
}

function updateAllResultScrollCues(root = document) {
  root.querySelectorAll(".result-scroll-surface").forEach((scroller) => {
    const cue = scroller.nextElementSibling?.classList.contains("result-scroll-cue")
      ? scroller.nextElementSibling
      : null;
    updateResultScrollCue(scroller, cue);
  });
}

function setupResultScrollCues(root = document) {
  root.querySelectorAll(resultScrollCueSelector).forEach((scroller) => {
    scroller.classList.add("result-scroll-surface");

    let cue = scroller.nextElementSibling?.classList.contains("result-scroll-cue")
      ? scroller.nextElementSibling
      : null;

    if (!cue) {
      cue = document.createElement("div");
      cue.className = "result-scroll-cue";
      cue.setAttribute("aria-hidden", "true");
      cue.appendChild(document.createElement("span"));
      scroller.insertAdjacentElement("afterend", cue);
    }

    if (!resultScrollCueReady.has(scroller)) {
      resultScrollCueReady.add(scroller);
      scroller.addEventListener("scroll", () => updateResultScrollCue(scroller, cue), { passive: true });
    }

    requestAnimationFrame(() => updateResultScrollCue(scroller, cue));
  });
}

function scrollWithoutSmooth(deltaY) {
  if (Math.abs(deltaY) < 1) return;

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollBy(0, deltaY);
  root.style.scrollBehavior = previousScrollBehavior;
}

function preserveTaskCarouselScroll(update) {
  const previousTop = taskCarousel?.getBoundingClientRect().top;
  update();

  if (typeof previousTop !== "number") return;

  const restorePosition = () => {
    const nextTop = taskCarousel?.getBoundingClientRect().top;
    if (typeof nextTop !== "number") return;
    scrollWithoutSmooth(nextTop - previousTop);
  };

  window.requestAnimationFrame(() => {
    restorePosition();
    window.requestAnimationFrame(restorePosition);
  });
}

function getBoundedTaskDragOffset(deltaX, startIndex, step) {
  if (!step || !taskSlides.length) return 0;

  const minOffset = -(taskSlides.length - 1 - startIndex) * step;
  const maxOffset = startIndex * step;
  if (deltaX < minOffset) return minOffset + (deltaX - minOffset) * 0.22;
  if (deltaX > maxOffset) return maxOffset + (deltaX - maxOffset) * 0.22;
  return deltaX;
}

function finishTaskDrag(event, isCanceled = false) {
  if (!taskDragState || !taskTrack) return;

  if (event?.pointerId === taskDragState.pointerId) {
    try {
      taskCarouselViewport?.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }

  const { startIndex, startX, lastX } = taskDragState;
  const step = getTaskSlideStep();
  const deltaX = lastX - startX;
  const boundedOffset = getBoundedTaskDragOffset(deltaX, startIndex, step);
  const threshold = Math.min(150, Math.max(54, step * 0.16));
  let nextIndex = startIndex;

  if (!isCanceled) {
    if (Math.abs(deltaX) >= threshold) {
      nextIndex = startIndex + (deltaX < 0 ? 1 : -1);
    } else {
      nextIndex = Math.round(startIndex - boundedOffset / (step || 1));
    }
  }

  nextIndex = clamp(nextIndex, 0, taskSlides.length - 1);
  taskDragState = null;
  taskTrack.classList.remove("is-dragging");

  if (nextIndex !== activeTaskIndex) {
    preserveTaskCarouselScroll(() => setTaskComparison(nextIndex));
  } else {
    updateTaskTrackPosition();
  }
}

function setupTaskCarouselDrag() {
  if (!taskCarouselViewport || !taskTrack || !taskSlides.length) return;

  taskCarouselViewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    taskDragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      startIndex: activeTaskIndex,
    };
    taskTrack.classList.add("is-dragging");
    taskCarouselViewport.setPointerCapture?.(event.pointerId);
  });

  taskCarouselViewport.addEventListener("pointermove", (event) => {
    if (!taskDragState || event.pointerId !== taskDragState.pointerId) return;

    taskDragState.lastX = event.clientX;
    const step = getTaskSlideStep();
    const deltaX = taskDragState.lastX - taskDragState.startX;
    const offset = getBoundedTaskDragOffset(deltaX, taskDragState.startIndex, step);
    updateTaskTrackPosition(offset);
  });

  taskCarouselViewport.addEventListener("pointerup", (event) => finishTaskDrag(event));
  taskCarouselViewport.addEventListener("pointercancel", (event) => finishTaskDrag(event, true));
  taskCarouselViewport.addEventListener("lostpointercapture", () => finishTaskDrag(null, true));
}

function resetTaskVideo(video) {
  if (!video) return;
  video.onended = null;
  video.pause();
  try {
    video.currentTime = 0;
  } catch {
    // Some browsers disallow seeking before metadata is available.
  }
}

function resetTaskPlayback() {
  playbackToken += 1;
  if (playbackRestartTimer) {
    window.clearTimeout(playbackRestartTimer);
    playbackRestartTimer = 0;
  }

  taskSlides.forEach((slide) => {
    slide.querySelectorAll(".comparison-panel").forEach((panel) => {
      panel.classList.remove("is-playing", "is-complete");
    });
    slide.querySelectorAll("video").forEach(resetTaskVideo);
  });
}

function playTaskVideo(video) {
  if (!video) return;
  video.muted = !taskAudioEnabled;
  video.volume = taskAudioEnabled ? 1 : 0;
  video.play().catch(() => {
    if (taskAudioEnabled) queueTaskAudioPlaybackRetry();
  });
}

const taskAudioRetryEvents = ["pointerdown", "keydown", "touchstart"];

function retryTaskAudioPlayback() {
  taskAudioRetryEvents.forEach((eventName) => {
    window.removeEventListener(eventName, retryTaskAudioPlayback, true);
  });
  taskAudioPlaybackRetryQueued = false;

  if (!taskAudioEnabled || !isTaskCarouselInView) return;

  const activeVideo = taskSlides[activeTaskIndex]?.querySelector(".comparison-panel.is-playing video");
  if (activeVideo) {
    playTaskVideo(activeVideo);
  } else {
    playCurrentTaskSequence();
  }
}

function queueTaskAudioPlaybackRetry() {
  if (taskAudioPlaybackRetryQueued) return;
  taskAudioPlaybackRetryQueued = true;
  taskAudioRetryEvents.forEach((eventName) => {
    window.addEventListener(eventName, retryTaskAudioPlayback, { capture: true, once: true });
  });
}

function syncTaskAudioState() {
  taskSlides.forEach((slide) => {
    slide.querySelectorAll("video").forEach((video) => {
      video.muted = !taskAudioEnabled;
      video.volume = taskAudioEnabled ? 1 : 0;
    });
  });

  if (taskAudioToggle) {
    taskAudioToggle.setAttribute("aria-pressed", String(taskAudioEnabled));
    taskAudioToggle.setAttribute(
      "aria-label",
      taskAudioEnabled ? "Turn task video sound off" : "Turn task video sound on",
    );
    taskAudioToggle.classList.toggle("is-on", taskAudioEnabled);
  }

  if (taskAudioLabel) {
    taskAudioLabel.textContent = taskAudioEnabled ? "Sound on" : "Sound off";
  }
}

function setTaskAudioEnabled(isEnabled) {
  taskAudioEnabled = isEnabled;
  syncTaskAudioState();

  const activeVideo = taskSlides[activeTaskIndex]?.querySelector(".comparison-panel.is-playing video");
  if (taskAudioEnabled && activeVideo) {
    activeVideo.play().catch(() => queueTaskAudioPlaybackRetry());
  }
}

function playCurrentTaskSequence() {
  const token = ++playbackToken;
  if (playbackRestartTimer) {
    window.clearTimeout(playbackRestartTimer);
    playbackRestartTimer = 0;
  }

  taskSlides.forEach((slide) => {
    slide.querySelectorAll(".comparison-panel").forEach((panel) => {
      panel.classList.remove("is-playing", "is-complete");
    });
    slide.querySelectorAll("video").forEach(resetTaskVideo);
  });

  const activeSlide = taskSlides[activeTaskIndex];
  const textPanel = activeSlide?.querySelector('[data-method="text"]');
  const edithPanel = activeSlide?.querySelector('[data-method="edith"]');
  const textVideo = textPanel?.querySelector("video");
  const edithVideo = edithPanel?.querySelector("video");

  if (!textVideo || !edithVideo) return;

  const restartSequence = () => {
    if (token !== playbackToken) return;
    textPanel.classList.remove("is-playing", "is-complete");
    edithPanel.classList.remove("is-playing", "is-complete");
    resetTaskVideo(textVideo);
    resetTaskVideo(edithVideo);
    playText();
  };

  const playText = () => {
    if (token !== playbackToken) return;
    edithPanel.classList.remove("is-playing", "is-complete");
    textPanel.classList.remove("is-complete");
    textPanel.classList.add("is-playing");
    try {
      textVideo.currentTime = 0;
    } catch {}
    textVideo.onended = () => {
      if (token !== playbackToken) return;
      textVideo.onended = null;
      textPanel.classList.remove("is-playing");
      textPanel.classList.add("is-complete");
      playEdith();
    };
    playTaskVideo(textVideo);
  };

  const playEdith = () => {
    if (token !== playbackToken) return;
    textPanel.classList.remove("is-playing");
    edithPanel.classList.remove("is-complete");
    edithPanel.classList.add("is-playing");
    try {
      edithVideo.currentTime = 0;
    } catch {}
    edithVideo.onended = () => {
      if (token !== playbackToken) return;
      edithVideo.onended = null;
      edithPanel.classList.remove("is-playing");
      edithPanel.classList.add("is-complete");
      playbackRestartTimer = window.setTimeout(restartSequence, 900);
    };
    playTaskVideo(edithVideo);
  };

  playText();
}

function setTaskComparison(index) {
  if (!taskComparisons.length) return;
  activeTaskIndex = Math.min(Math.max(index, 0), taskComparisons.length - 1);
  const task = taskComparisons[activeTaskIndex];

  if (taskCounter) {
    taskCounter.textContent = `Task ${String(activeTaskIndex + 1).padStart(2, "0")} / ${String(taskComparisons.length).padStart(2, "0")}`;
  }
  if (taskTitle) taskTitle.textContent = task.title;
  if (taskDescription) {
    const description = task.description || "";
    taskDescription.textContent = description;
    taskDescription.hidden = !description;
  }

  taskDots?.querySelectorAll("[data-task-index]").forEach((button) => {
    const isActive = Number(button.dataset.taskIndex) === activeTaskIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  taskSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeTaskIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  if (taskPrev) taskPrev.disabled = activeTaskIndex === 0;
  if (taskNext) taskNext.disabled = activeTaskIndex === taskComparisons.length - 1;
  updateTaskTrackPosition();
  if (isTaskCarouselInView) {
    playCurrentTaskSequence();
  } else {
    resetTaskPlayback();
  }
}

taskPrev?.addEventListener("click", (event) => {
  event.preventDefault();
  preserveTaskCarouselScroll(() => {
    setTaskComparison(activeTaskIndex - 1);
  });
});

taskNext?.addEventListener("click", (event) => {
  event.preventDefault();
  preserveTaskCarouselScroll(() => {
    setTaskComparison(activeTaskIndex + 1);
  });
});

taskDots?.querySelectorAll("[data-task-index]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    preserveTaskCarouselScroll(() => {
      setTaskComparison(Number(button.dataset.taskIndex));
    });
  });
});

taskAudioToggle?.addEventListener("click", () => {
  setTaskAudioEnabled(!taskAudioEnabled);
});

function setupTaskPlaybackObserver() {
  if (!taskCarousel || !taskSlides.length) return;

  if (!("IntersectionObserver" in window)) {
    isTaskCarouselInView = true;
    playCurrentTaskSequence();
    return;
  }

  const taskPlaybackObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const shouldPlay = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.2);
      if (shouldPlay === isTaskCarouselInView) return;

      isTaskCarouselInView = shouldPlay;
      if (isTaskCarouselInView) {
        playCurrentTaskSequence();
      } else {
        resetTaskPlayback();
      }
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: [0, 0.2, 0.5],
    },
  );

  taskPlaybackObserver.observe(taskCarousel);
}

if (taskTrack && taskSlides.length) {
  syncTaskAudioState();
  setTaskComparison(activeTaskIndex);
  setupTaskPlaybackObserver();
  setupTaskCarouselDrag();
  window.addEventListener("resize", () => updateTaskTrackPosition());
}

if (evaluationTaskGrid && evaluationTaskScrollCue) {
  updateEvaluationTaskScrollCue();
  evaluationTaskGrid.addEventListener("scroll", updateEvaluationTaskScrollCue, { passive: true });
  window.addEventListener("resize", updateEvaluationTaskScrollCue);
  window.addEventListener("load", updateEvaluationTaskScrollCue);
}

setupResultScrollCues(document.querySelector("#results") || document);
window.addEventListener("resize", () => updateAllResultScrollCues(), { passive: true });
window.addEventListener("load", () => updateAllResultScrollCues(), { passive: true });

const methodFigures = {
  overall: "assets/figure_policy_input_output_0.png",
  signals: "assets/figure_policy_input_output_1.png",
  "high-level": "assets/videos/high_level_policy.mp4?v=hd-20260605",
  "low-level": "assets/videos/low_level_policy_updated.mp4?v=hd-20260605",
};

const methodFigureNotes = {
  overall: {
    title: "Overall Design",
    text:
      `<p>
        EDITH converts verbal instructions and egocentric context into
        instruction-keyframe subtasks, stores them in \\(Q\\), and executes
        each subtask with the robot policy.
      </p>`,
  },
  signals: {
    title: "Human Signals",
    text:
      `<p>
        EDITH reads recent first-person context \\(C_{t-H:t}^{\\mathrm{ego}}\\)
        and speech \\(\\ell_{t-H:t}\\), with gaze overlaid on the RGB stream
        to expose nonverbal target cues.
      </p>
      <div class="method-signal-demo">
        <video class="method-note-video" autoplay muted loop playsinline preload="metadata" aria-label="Egocentric input stream with gaze and speech">
          <source src="assets/videos/ego_input.mp4" type="video/mp4">
        </video>
      </div>`,
  },
  "high-level": {
    title: "High-level Policy",
    text:
      `<p>
        \\(\\pi_h\\) periodically infers intent from the human signal window
        and generates instruction-keyframe subtasks when the relevant nonverbal
        cue appears in the stream. The generated subtasks are stored in
        \\(Q\\), an asynchronous queue consumed by \\(\\pi_l\\): once the
        current head task is completed, \\(\\pi_l\\) pops the next subtask and
        continues execution.
      </p>
      <div class="high-level-keyframe-demo">
        <figure class="high-level-input-video">
          <video data-keyframe-video autoplay muted loop playsinline preload="metadata" aria-label="Egocentric input stream used by the high-level policy">
            <source src="assets/videos/ego_input.mp4" type="video/mp4">
          </video>
          <figcaption>Human signal stream</figcaption>
        </figure>
        <div class="subtask-board" aria-label="Generated subtasks">
          <h4>Subtasks</h4>
          <article class="subtask-card" data-keyframe-time="3">
            <div class="subtask-keyframe">
              <span>Keyframe \\(C_1^{\\mathrm{key}}\\)</span>
              <img src="assets/keyframe1.png" alt="Keyframe for screwdriver request">
            </div>
            <div class="subtask-task">
              <span>\\([\\mathrm{TASK}]_1\\)</span>
              <p>Pick up the screwdriver and pass it to human.</p>
            </div>
          </article>
          <article class="subtask-card" data-keyframe-time="10">
            <div class="subtask-keyframe">
              <span>Keyframe \\(C_2^{\\mathrm{key}}\\)</span>
              <img src="assets/keyframe2.png" alt="Keyframe for metal profile request">
            </div>
            <div class="subtask-task">
              <span>\\([\\mathrm{TASK}]_2\\)</span>
              <p>Pick up the 10 cm metal profile.</p>
            </div>
          </article>
        </div>
      </div>`,
  },
  "low-level": {
    title: "Low-level Policy",
    text:
      `<p>
        \\(\\pi_l\\) conditions on robot observation \\(o_t\\), \\([\\mathrm{TASK}]\\),
        and \\(C^{\\mathrm{key}}\\) to produce action \\(a_t\\) and completion
        probability \\(p_t\\). Once \\(p_t\\) crosses a threshold, it
        pops the next subtask from \\(Q\\).
      </p>
      <div class="low-level-policy-demo" data-low-level-policy-demo>
        <section class="low-level-vla-input" aria-label="VLA input">
          <h4>VLA Input</h4>
          <div class="low-level-input-row">
            <article class="low-level-subtask-card subtask-card is-generated" aria-label="Current low-level subtask">
              <div class="subtask-keyframe low-level-subtask-keyframe">
                <span data-low-level-keyframe-label>Keyframe C<sup>key</sup><sub>1</sub></span>
                <img data-low-level-keyframe src="assets/keyframe1.png" alt="Current keyframe input 1">
              </div>
              <div class="subtask-task low-level-subtask-task">
                <span data-low-level-task-label>[TASK]<sub>1</sub></span>
                <p data-low-level-task>Pick up the screwdriver and pass it to human.</p>
              </div>
            </article>
            <figure class="low-level-center-demo">
              <figcaption>Robot observation \\(o_t\\)</figcaption>
              <video class="low-level-center-video" data-low-level-observation autoplay muted loop playsinline preload="metadata" aria-label="Robot observation video for the low-level policy">
                <source src="assets/videos/low_center_rgb_top.mp4" type="video/mp4">
              </video>
            </figure>
          </div>
        </section>
        <section class="low-level-vla-output" aria-label="VLA output">
          <h4>Output</h4>
          <div class="low-level-output-row">
            <div class="low-level-output-item low-level-action-stream">
              <p>Robot Action \\(a_t\\)</p>
              <pre data-low-level-action>loading action</pre>
            </div>
            <div class="low-level-output-item low-level-completion-stream">
              <p>Completion \\(p_t\\)</p>
              <output data-low-level-completion>0</output>
            </div>
          </div>
        </section>
      </div>`,
  },
};

const methodFigureImage = document.querySelector("#method-figure-image");
const methodFigureVideo = document.querySelector("#method-figure-video");
const methodFigureStage = document.querySelector(".method-figure-stage");
const methodFigureNoteTitle = document.querySelector("#method-figure-note-title");
const methodFigureNoteText = document.querySelector("#method-figure-note-text");
const methodFigureTabs = Array.from(document.querySelectorAll("[data-method-figure-step]"));
let methodFigureStep = "overall";
let lowLevelPolicyFrameRequest = null;
const lowLevelActionDisplayIndices = [2, 9, 7, 1];

function typesetMath(root = document.body) {
  if (!window.MathJax?.typesetPromise) return;

  window.MathJax.typesetPromise([root]).catch(() => {});
}

function stopLowLevelPolicyDemo() {
  if (!lowLevelPolicyFrameRequest) return;

  window.cancelAnimationFrame(lowLevelPolicyFrameRequest);
  lowLevelPolicyFrameRequest = null;
}

function formatLowLevelAction(action) {
  if (!Array.isArray(action) || !action.length) return "[action unavailable]";

  const values = lowLevelActionDisplayIndices
    .filter((index) => index < action.length)
    .map((index) => Number(action[index]).toFixed(4));

  if (values.length > 2) {
    return `[${values.slice(0, 2).join(", ")},   ...,   ${values.slice(2).join(", ")}]`;
  }

  return `[${values.join(", ")}]`;
}

function lowLevelActionSignature(action) {
  return lowLevelActionDisplayIndices
    .filter((index) => index < action.length)
    .map((index) => Number(action[index]).toFixed(4))
    .join("|");
}

function buildLowLevelActionStream(actions) {
  const stream = [];
  let lastSignature = "";

  actions.forEach((action) => {
    const signature = lowLevelActionSignature(action);
    if (signature === lastSignature) return;

    stream.push(action);
    lastSignature = signature;
  });

  return stream.length ? stream : actions;
}

function setupLowLevelPolicyDemo() {
  const demo = methodFigureNoteText?.querySelector("[data-low-level-policy-demo]");
  if (!demo) return;

  const video = demo.querySelector("[data-low-level-observation]");
  const actionOutput = demo.querySelector("[data-low-level-action]");
  const completionOutput = demo.querySelector("[data-low-level-completion]");
  const subtaskCard = demo.querySelector(".low-level-subtask-card");
  const keyframeImage = demo.querySelector("[data-low-level-keyframe]");
  const keyframeLabel = demo.querySelector("[data-low-level-keyframe-label]");
  const taskLabel = demo.querySelector("[data-low-level-task-label]");
  const taskText = demo.querySelector("[data-low-level-task]");
  const actionData = window.EDITH_LOW_LEVEL_ACTIONS;
  const actions = actionData?.values || [];
  const actionStream = buildLowLevelActionStream(actions);
  const fps = actionData?.fps || 15;
  const keyframeSwitchTime = 7.15;
  const completionWindows = [
    [7.15, 8],
    [14.5, 15],
  ];

  if (!video || !actionOutput || !completionOutput || !actionStream.length) return;

  let lastFrameIndex = -1;
  let lastKeyframeIndex = -1;
  let lastCompletion = -1;

  const syncOutputs = () => {
    const currentTime = video.currentTime || 0;
    const fallbackDuration = actions.length / fps;
    const videoDuration =
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : fallbackDuration;
    const frameIndex = Math.min(
      actionStream.length - 1,
      Math.max(0, Math.floor((currentTime / videoDuration) * actionStream.length)),
    );
    const keyframeIndex = currentTime >= keyframeSwitchTime ? 2 : 1;
    const completion = completionWindows.some(([start, end]) => currentTime >= start && currentTime < end)
      ? 1
      : 0;

    if (frameIndex !== lastFrameIndex) {
      actionOutput.textContent = formatLowLevelAction(actionStream[frameIndex]);
      lastFrameIndex = frameIndex;
    }

    if (completion !== lastCompletion) {
      completionOutput.value = String(completion);
      completionOutput.textContent = String(completion);
      completionOutput.closest(".low-level-completion-stream")?.classList.toggle(
        "is-active",
        completion === 1,
      );
      subtaskCard?.classList.toggle("is-complete", completion === 1);
      lastCompletion = completion;
    }

    if (keyframeIndex !== lastKeyframeIndex) {
      if (keyframeImage) {
        keyframeImage.src = keyframeIndex === 2 ? "assets/keyframe2.png" : "assets/keyframe1.png";
        keyframeImage.alt = `Current keyframe input ${keyframeIndex}`;
      }

      if (keyframeLabel) {
        keyframeLabel.innerHTML = `Keyframe C<sup>key</sup><sub>${keyframeIndex}</sub>`;
      }

      if (taskLabel) {
        taskLabel.innerHTML = `[TASK]<sub>${keyframeIndex}</sub>`;
      }

      if (taskText) {
        taskText.textContent =
          keyframeIndex === 2
            ? "Pick up the 10 cm metal profile."
            : "Pick up the screwdriver and pass it to human.";
      }

      lastKeyframeIndex = keyframeIndex;
    }
  };

  const tick = () => {
    syncOutputs();
    lowLevelPolicyFrameRequest = window.requestAnimationFrame(tick);
  };

  try {
    video.currentTime = 0;
  } catch {
    // The video may not be seekable until metadata is loaded.
  }

  video.addEventListener("loadedmetadata", syncOutputs);
  video.addEventListener("timeupdate", syncOutputs);
  video.addEventListener("seeked", syncOutputs);
  video.addEventListener("ended", () => {
    video.currentTime = 0;
    syncOutputs();
    video.play().catch(() => {});
  });

  syncOutputs();
  video.play().catch(() => {});
  tick();
}

function setupMethodNoteMedia(step) {
  if (!methodFigureNoteText) return;

  stopLowLevelPolicyDemo();

  methodFigureNoteText.querySelectorAll("video").forEach((video) => {
    video.muted = true;
    video.play().catch(() => {});
  });

  if (step === "low-level") {
    setupLowLevelPolicyDemo();
    return;
  }

  if (step !== "high-level") return;

  const keyframeVideo = methodFigureNoteText.querySelector("[data-keyframe-video]");
  const subtaskCards = Array.from(methodFigureNoteText.querySelectorAll("[data-keyframe-time]"));
  if (!keyframeVideo || !subtaskCards.length) return;

  try {
    keyframeVideo.currentTime = 0;
  } catch {
    // The video may not be seekable until metadata is loaded.
  }

  const syncSubtasks = () => {
    const currentTime = keyframeVideo.currentTime || 0;
    subtaskCards.forEach((card) => {
      const keyframeTime = Number(card.dataset.keyframeTime);
      card.classList.toggle("is-generated", currentTime >= keyframeTime);
    });
  };

  keyframeVideo.addEventListener("loadedmetadata", syncSubtasks);
  keyframeVideo.addEventListener("timeupdate", syncSubtasks);
  keyframeVideo.addEventListener("seeked", syncSubtasks);
  syncSubtasks();
}

function setMethodFigure(step, options = {}) {
  const src = methodFigures[step];
  if (!src || !methodFigureImage || !methodFigureVideo) return;
  const isVideo = src.includes(".mp4");

  methodFigureStep = step;
  methodFigureTabs.forEach((button) => {
    const isActive = button.dataset.methodFigureStep === step;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const note = methodFigureNotes[step];
  if (note && methodFigureNoteTitle && methodFigureNoteText) {
    methodFigureNoteTitle.textContent = note.title;
    methodFigureNoteText.innerHTML = note.text;
    setupMethodNoteMedia(step);
    typesetMath(methodFigureNoteText);
  }

  const updateMedia = () => {
    const label = buttonLabelForMethodFigure(step);
    if (isVideo) {
      methodFigureImage.hidden = true;
      methodFigureVideo.hidden = false;
      if (methodFigureVideo.getAttribute("src") !== src) {
        methodFigureVideo.src = src;
        methodFigureVideo.load();
      }
      methodFigureVideo.setAttribute("aria-label", `${label} method video`);
      try {
        methodFigureVideo.currentTime = 0;
      } catch {
        // The video may not be seekable until metadata is loaded.
      }
      methodFigureVideo.play().catch(() => {});
    } else {
      methodFigureVideo.pause();
      methodFigureVideo.removeAttribute("src");
      methodFigureVideo.load();
      methodFigureVideo.hidden = true;
      methodFigureImage.hidden = false;
      methodFigureImage.src = src;
      methodFigureImage.alt = `${label} method figure`;
    }
    methodFigureStage?.classList.remove("is-changing");
  };

  const activeSrc = isVideo
    ? methodFigureVideo.getAttribute("src")
    : methodFigureImage.getAttribute("src");
  if (options.instant || activeSrc === src) {
    updateMedia();
    return;
  }

  methodFigureStage?.classList.add("is-changing");
  window.setTimeout(updateMedia, 120);
}

function buttonLabelForMethodFigure(step) {
  const activeButton = methodFigureTabs.find((button) => button.dataset.methodFigureStep === step);
  return activeButton?.textContent.trim() || "EDITH";
}

methodFigureTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setMethodFigure(button.dataset.methodFigureStep);
  });
});

document.querySelectorAll("[data-method-figure-link]").forEach((button) => {
  button.addEventListener("click", () => {
    setMethodFigure(button.dataset.methodFigureLink);
  });
});

const noisyModal = document.querySelector("#noisy-modal");
const noisyModalVideo = noisyModal?.querySelector("video");
const noisyModalOpen = document.querySelector("[data-noisy-modal-open]");
const noisyModalClose = noisyModal?.querySelector("[data-noisy-modal-close]");

function openNoisyModal() {
  if (!noisyModal) return;

  if (typeof noisyModal.showModal === "function") {
    noisyModal.showModal();
  } else {
    noisyModal.setAttribute("open", "");
  }

  noisyModalVideo?.play().catch(() => {});
}

function closeNoisyModal() {
  if (!noisyModal) return;

  if (typeof noisyModal.close === "function") {
    noisyModal.close();
  } else {
    noisyModal.removeAttribute("open");
  }
}

noisyModalOpen?.addEventListener("click", openNoisyModal);
noisyModalClose?.addEventListener("click", closeNoisyModal);

noisyModal?.addEventListener("click", (event) => {
  if (event.target === noisyModal) closeNoisyModal();
});

noisyModal?.addEventListener("close", () => {
  noisyModalVideo?.pause();
});

const detailResultsModal = document.querySelector("#detail-results-modal");
const detailResultsModalBody = detailResultsModal?.querySelector("[data-detail-modal-body]");
const detailResultsModalClose = detailResultsModal?.querySelector("[data-detail-modal-close]");
const detailResultsModalTitle = detailResultsModal?.querySelector("#detail-results-modal-title");
let activeDetailToggle = null;

function closeDetailResultsModal() {
  if (!detailResultsModal) return;

  if (typeof detailResultsModal.close === "function") {
    detailResultsModal.close();
  } else {
    detailResultsModal.removeAttribute("open");
    detailResultsModal.dispatchEvent(new Event("close"));
  }
}

document.querySelectorAll("[data-detail-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.detailToggle);
    if (!target || !detailResultsModal || !detailResultsModalBody) return;

    const detailClone = target.cloneNode(true);
    detailClone.removeAttribute("id");
    detailClone.removeAttribute("hidden");
    detailClone.hidden = false;
    detailClone.classList.add("is-visible");

    detailResultsModalBody.replaceChildren(detailClone);
    if (detailResultsModalTitle) {
      detailResultsModalTitle.textContent = button.dataset.detailTitle || "Detailed Results";
    }
    activeDetailToggle = button;
    button.setAttribute("aria-expanded", "true");

    if (typeof detailResultsModal.showModal === "function") {
      detailResultsModal.showModal();
    } else {
      detailResultsModal.setAttribute("open", "");
    }

    typesetMath(detailResultsModalBody);
    setupResultScrollCues(detailResultsModalBody);
    requestAnimationFrame(() => {
      updateAllResultScrollCues(detailResultsModalBody);
      requestAnimationFrame(() => updateAllResultScrollCues(detailResultsModalBody));
    });
  });
});

detailResultsModalClose?.addEventListener("click", closeDetailResultsModal);

detailResultsModal?.addEventListener("click", (event) => {
  if (event.target === detailResultsModal) closeDetailResultsModal();
});

detailResultsModal?.addEventListener("close", () => {
  activeDetailToggle?.setAttribute("aria-expanded", "false");
  activeDetailToggle = null;
  detailResultsModalBody?.replaceChildren();
});

if (methodFigureImage && methodFigureTabs.length) {
  setMethodFigure(methodFigureStep, { instant: true });
}

document.querySelectorAll("[data-video-sequence]").forEach((video) => {
  const sequence = video.dataset.videoSequence
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean);

  if (!sequence.length) return;

  let index = 0;

  const playCurrent = () => {
    video.src = sequence[index];
    video.load();
    video.play().catch(() => {});
  };

  const advance = () => {
    index = (index + 1) % sequence.length;
    playCurrent();
  };

  video.addEventListener("ended", advance);
  video.addEventListener("error", advance);
});

document.querySelectorAll("[data-user-study-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".user-study-carousel-track");
  const originalSlides = Array.from(track?.children || []);

  if (!track || originalSlides.length < 2) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let slideIndex = 0;
  let slideStep = 0;
  let slideTimer = 0;

  originalSlides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  const setCarouselTransform = (animate) => {
    track.style.transition = animate
      ? "transform 600ms cubic-bezier(0.2, 0.82, 0.2, 1)"
      : "none";
    track.style.transform = `translate3d(${-slideIndex * slideStep}px, 0, 0)`;
  };

  const measureCarousel = () => {
    const firstSlide = track.children[0];
    if (!firstSlide) return;

    const trackStyle = window.getComputedStyle(track);
    const gap = Number.parseFloat(trackStyle.columnGap || trackStyle.gap || "0") || 0;
    slideStep = firstSlide.getBoundingClientRect().width + gap;
    setCarouselTransform(false);
  };

  const advanceCarousel = () => {
    if (!slideStep || reducedMotion.matches) return;
    slideIndex += 1;
    setCarouselTransform(true);
  };

  const startCarousel = () => {
    if (slideTimer || reducedMotion.matches) return;
    slideTimer = window.setInterval(advanceCarousel, 2000);
  };

  const stopCarousel = () => {
    if (!slideTimer) return;
    window.clearInterval(slideTimer);
    slideTimer = 0;
  };

  track.addEventListener("transitionend", () => {
    if (slideIndex < originalSlides.length) return;
    slideIndex = 0;
    setCarouselTransform(false);
  });

  window.addEventListener("resize", measureCarousel, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCarousel();
    } else {
      startCarousel();
    }
  });

  requestAnimationFrame(() => {
    measureCarousel();
    startCarousel();
  });
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
