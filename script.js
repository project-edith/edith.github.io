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

const demos = {
  gaze: {
    kicker: "Demo 01",
    title: "Gaze-anchored context tracking",
    description:
      "EDITH uses user attention and egocentric context to decide which scene elements should influence the next robot response.",
    src: "assets/videos/eye-tracking-demo.mp4",
    poster: "assets/posters/eye-tracking-demo.jpg",
    trace: [
      "Observe user focus and object layout.",
      "Bind ambiguous references to likely targets.",
      "Update the interaction state for the robot policy.",
    ],
  },
  object: {
    kicker: "Demo 02",
    title: "Object-centered collaboration",
    description:
      "The system keeps track of object state and task progress while the robot coordinates with a person around a shared workspace.",
    src: "assets/videos/tumbler-demo.mp4",
    poster: "assets/posters/tumbler-demo.jpg",
    trace: [
      "Detect the active object and manipulation phase.",
      "Predict the next useful assistance point.",
      "Execute or explain the robot action with context.",
    ],
  },
  tool: {
    kicker: "Demo 03",
    title: "Tool-use assistance",
    description:
      "EDITH represents tool affordances and user intent so the robot can support multi-step activity instead of reacting to isolated commands.",
    src: "assets/videos/tool-demo.mp4",
    poster: "assets/posters/tool-demo.jpg",
    trace: [
      "Parse the tool, target, and user motion.",
      "Maintain a short-horizon plan across steps.",
      "Recover when the observed action diverges from expectation.",
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
  perception: {
    kicker: "Module 01",
    title: "Grounding user intent in the current scene.",
    description:
      "EDITH starts by aligning user attention, body motion, and object state so that ambiguous language can be resolved against the actual interaction context.",
    points: [
      "Tracks salient objects and user focus over time.",
      "Builds a task-conditioned scene representation.",
      "Flags low-confidence observations before acting.",
    ],
  },
  memory: {
    kicker: "Module 02",
    title: "Maintaining interaction memory across turns.",
    description:
      "The system stores recent instructions, corrections, object changes, and uncertainty signals so each response is conditioned on the evolving task.",
    points: [
      "Links dialogue references to persistent scene entities.",
      "Stores corrections as constraints for future actions.",
      "Separates task progress from transient visual observations.",
    ],
  },
  policy: {
    kicker: "Module 03",
    title: "Choosing when to ask, explain, or act.",
    description:
      "EDITH uses the grounded state and interaction memory to decide whether the robot should clarify intent, communicate uncertainty, or execute an action.",
    points: [
      "Balances action confidence against clarification cost.",
      "Generates context-aware robot responses.",
      "Recovers from mismatch between predicted and observed outcomes.",
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

document.querySelectorAll(".method-tab, .method-node, .arch-module, .arch-memory").forEach((element) => {
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
