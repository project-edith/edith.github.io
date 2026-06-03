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
const taskSlides = [...document.querySelectorAll(".task-slide")];
const taskCounter = document.querySelector("#task-counter");
const taskTitle = document.querySelector("#task-title");
const taskDescription = document.querySelector("#task-description");
const taskPrev = document.querySelector("#task-prev");
const taskNext = document.querySelector("#task-next");
const taskDots = document.querySelector("#task-dots");
let activeTaskIndex = 0;
let playbackToken = 0;
let playbackRestartTimer = 0;

function updateTaskTrackPosition() {
  if (!taskTrack || !taskSlides.length) return;
  const slideWidth = taskSlides[0].getBoundingClientRect().width;
  const trackStyle = getComputedStyle(taskTrack);
  const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "0") || 0;
  taskTrack.style.transform = `translateX(${-activeTaskIndex * (slideWidth + gap)}px)`;
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

function playTaskVideo(video) {
  if (!video) return;
  video.play().catch(() => {});
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
  playCurrentTaskSequence();
}

taskPrev?.addEventListener("click", () => {
  setTaskComparison(activeTaskIndex - 1);
});

taskNext?.addEventListener("click", () => {
  setTaskComparison(activeTaskIndex + 1);
});

taskDots?.querySelectorAll("[data-task-index]").forEach((button) => {
  button.addEventListener("click", () => {
    setTaskComparison(Number(button.dataset.taskIndex));
  });
});

if (taskTrack && taskSlides.length) {
  setTaskComparison(activeTaskIndex);
  window.addEventListener("resize", updateTaskTrackPosition);
}

const methodFigures = {
  signals: "assets/figure_policy_input_output_1.png",
  "high-level": "assets/figure_policy_input_output_2.png",
  queue: "assets/figure_policy_input_output_3.png",
  "low-level": "assets/figure_policy_input_output_4.png",
};

const methodFigureNotes = {
  signals: {
    title: "Human Signals",
    text:
      "EDITH reads recent first-person context C<sup>ego</sup><sub>t-H:t</sub> and speech &ell;<sub>t-H:t</sub>, with gaze overlaid on the RGB stream to expose nonverbal target cues.",
  },
  "high-level": {
    title: "High-level Policy",
    text:
      "&pi;<sub>h</sub> periodically infers intent from the human signal window and outputs subtasks ([TASK]<sub>i</sub>, C<sup>key</sup><sub>i</sub>), pairing each fine-grained instruction with the keyframe where the cue is clearest.",
  },
  queue: {
    title: "Task Queue",
    text:
      "Q connects the planner and executor asynchronously: &pi;<sub>h</sub> appends newly identified subtasks while &pi;<sub>l</sub> executes the subtask at the head of the queue.",
  },
  "low-level": {
    title: "Low-level Policy",
    text:
      "&pi;<sub>l</sub> conditions on robot observation o<sub>t</sub>, [TASK], and C<sup>key</sup> to produce action a<sub>t</sub> and completion probability p<sub>t</sub>. Once p<sub>t</sub> crosses a threshold, it pops the next subtask from Q.",
  },
};

const methodFigureImage = document.querySelector("#method-figure-image");
const methodFigureStage = document.querySelector(".method-figure-stage");
const methodFigureNoteTitle = document.querySelector("#method-figure-note-title");
const methodFigureNoteText = document.querySelector("#method-figure-note-text");
const methodFigureTabs = Array.from(document.querySelectorAll("[data-method-figure-step]"));
let methodIntroTimer = 0;
let methodFigureStep = "low-level";

function setMethodFigure(step, options = {}) {
  const src = methodFigures[step];
  if (!src || !methodFigureImage) return;

  if (methodIntroTimer) {
    window.clearTimeout(methodIntroTimer);
    methodIntroTimer = 0;
  }

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
  }

  const updateImage = () => {
    methodFigureImage.src = src;
    methodFigureImage.alt = `${buttonLabelForMethodFigure(step)} method figure`;
    methodFigureStage?.classList.remove("is-changing");
  };

  if (options.instant || methodFigureImage.src.endsWith(src)) {
    updateImage();
    return;
  }

  methodFigureStage?.classList.add("is-changing");
  window.setTimeout(updateImage, 120);
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

document.querySelectorAll("[data-detail-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.detailToggle);
    if (!target) return;

    const isExpanded = button.getAttribute("aria-expanded") === "true";
    target.hidden = isExpanded;
    button.setAttribute("aria-expanded", String(!isExpanded));
    button.textContent = isExpanded ? "More detail results" : "Hide detail results";
  });
});

if (methodFigureImage && methodFigureTabs.length) {
  setMethodFigure(methodFigureStep, { instant: true });
  methodIntroTimer = window.setTimeout(() => {
    setMethodFigure("signals");
  }, 1300);
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
