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

const taskComparisons = [
  {
    title: "Muffin Serving",
    description:
      "Compare the language-only TextVLA baseline against EDITH on visually similar muffin requests.",
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
    title: "Tool Passing",
    description:
      "Compare tool-passing behavior when language alone is underspecified versus EDITH with gaze grounding.",
    text: {
      src: "assets/videos/passing_tool_textvla.mp4",
      poster: "assets/posters/passing-tool-text.jpg",
    },
    edith: {
      src: "assets/videos/edith_passing_tool.mp4",
      poster: "assets/posters/passing-tool-edith.jpg",
    },
  },
  {
    title: "Tumbler Sorting",
    description:
      "Compare the text-only sorting instruction against EDITH's egocentric and nonverbal grounding.",
    text: {
      src: "assets/videos/tumbler_text_vla.mp4",
      poster: "assets/posters/tumbler-text.jpg",
    },
    edith: {
      src: "assets/videos/tumbler_edith.mp4",
      poster: "assets/posters/tumbler-edith.jpg",
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
    };
    playTaskVideo(edithVideo);
  };

  playText();
}

function setTaskComparison(index) {
  if (!taskComparisons.length) return;
  activeTaskIndex = (index + taskComparisons.length) % taskComparisons.length;
  const task = taskComparisons[activeTaskIndex];

  if (taskCounter) {
    taskCounter.textContent = `Task ${String(activeTaskIndex + 1).padStart(2, "0")} / ${String(taskComparisons.length).padStart(2, "0")}`;
  }
  if (taskTitle) taskTitle.textContent = task.title;
  if (taskDescription) taskDescription.textContent = task.description;

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
