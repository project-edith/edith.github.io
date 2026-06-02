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
} else {
  animatedElements.forEach((element) => element.classList.add("is-visible"));
}

const demos = {
  gaze: {
    kicker: "Demo 01",
    title: "Egocentric context and gaze",
    description:
      "EDITH streams the human's first-person view and gaze so brief nonverbal signals can ground underspecified language.",
    src: "assets/videos/eye-tracking-demo.mp4",
    poster: "assets/posters/eye-tracking-demo.jpg",
    trace: [
      "Capture first-person RGB frames from smart glasses.",
      "Overlay gaze markers on the egocentric context.",
      "Pair the context stream with the user's utterance.",
    ],
  },
  object: {
    kicker: "Demo 02",
    title: "Subtask execution",
    description:
      "The low-level policy executes each queued subtask from a fine-grained instruction and keyframe.",
    src: "assets/videos/tumbler-demo.mp4",
    poster: "assets/posters/tumbler-demo.jpg",
    trace: [
      "Condition on the robot observation and current subtask.",
      "Predict a robot action and completion probability.",
      "Pop the next subtask once the current one is complete.",
    ],
  },
  tool: {
    kicker: "Demo 03",
    title: "Tool-passing interaction",
    description:
      "EDITH handles tool-passing tasks where language alone is underspecified and gaze identifies the target.",
    src: "assets/videos/tool-demo.mp4",
    poster: "assets/posters/tool-demo.jpg",
    trace: [
      "Infer intent from verbal and nonverbal human signals.",
      "Create instruction-keyframe subtasks.",
      "Execute the subtasks with the VLA low-level policy.",
    ],
  },
};

const demoVideo = document.querySelector("#demo-video");
const demoKicker = document.querySelector("#demo-kicker");
const demoTitle = document.querySelector("#demo-title");
const demoDescription = document.querySelector("#demo-description");
const demoTrace = document.querySelector("#demo-trace");
const progressBar = document.querySelector("#video-progress-bar");

function setDemo(id) {
  const demo = demos[id];
  if (!demo || !demoVideo) return;

  document.querySelectorAll("[data-demo]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.demo === id);
  });

  demoVideo.pause();
  demoVideo.poster = demo.poster;
  const source = demoVideo.querySelector("source");
  if (source) {
    source.src = demo.src;
  }
  demoVideo.load();
  demoVideo.play().catch(() => {});

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
