(() => {
  "use strict";

  if (typeof menuLayouts === "undefined") {
    throw new Error(
      "menu-layouts.js did not load. Keep index.html and menu-layouts.js in the same folder, then open the site through a local server."
    );
  }

  const DESIGN_WIDTH = 1440;
  const DESIGN_HEIGHT = 1024;
  const WHEEL_THRESHOLD = 45;
  const TRANSITION_LOCK_MS = 560;
  const PASSCODE = "HA01";

  const labels = {
    Identity: "identity",
    Research: "research",
    Experiments: "experiments",
    About: "about",
    Graphics: "graphics",
    Index: "index"
  };

  const descriptions = {
    About:
    "01 is an independent design studio founded by G. Hannah Park in Switzerland in 2026. The studio approaches design as a system rather than an outcome, developing identities, graphics, interactions, and research that expand how visual communication is experienced.",

    Identity:
    "Brand systems that shape experiences—from typography and visual languages to digital interfaces, spatial applications, and every touchpoint in between.",

    Graphics:
    "Posters, lettering, type design, editorial graphics, and other visual works where image, composition, and typography become expressive forms.",

    Experiments:
    "Interactive works, creative coding, motion, installations, and medium-driven explorations that push the boundaries of visual communication.",

    Research:
    "Theses, publications, essays, and editorial projects investigating design, technology, and the evolving role of visual communication.",

    Index:
    "A complete archive of projects, experiments, writings, and works in chronological order."
  };

  const moduleImages = {
    About: "assets/menu/about.webp",
    Identity: "assets/menu/identity.webp",
    Graphics: "assets/menu/graphics.webp",
    Experiments: "assets/menu/experiments.webp",
    Research: "assets/menu/research.webp",
    Index: "assets/menu/index.webp"
    };

  // Project index shown under each module's text when hovered.
  // `image` drives the full-page background — replace these
  // placeholder picsum URLs and hrefs with real project assets/pages.
  //
  // `year` is a placeholder on every entry — none of this data had
  // real years, so these are invented purely so the Index filter has
  // something to sort by; replace with the actual dates.
  // `ready: true` marks the handful of projects that have a real
  // case study; everything else shows "Case study coming soon" on
  // hover instead of the normal underline (see createModules()).
    const projectsByModule = {
    About: [],

    Identity: [
        { title: "Carnault", id: "carnault", href: "projects/carnault/", image: "assets/carnault.png", year: 2026, ready: true },
        { title: "Architecture and Human Augmentation, ETH", id: "aha", href: "projects/aha/", image: "assets/aha.webp", year: 2025, ready: true },
        { title: "Aramiko", id: "aramiko", href: "projects/aramiko/", image: "assets/aramiko.webp", year: 2025, ready: true },
        { title: "Museumsnacht Basel", id: "museumsnacht-basel", href: "projects/museumsnacht-basel/", image: "assets/museumsnacht-basel.webp", year: 2025, ready: true },
        { title: "Neueden", id: "neueden", href: "projects/neueden/", image: "assets/neueden.webp", year: 2024 },
        { title: "Mach Schwarz", id: "mach-schwarz", href: "projects/mach-schwarz/", image: "assets/mach-schwarz.webp", year: 2023, ready: true }
    ],

    Graphics: [
        { title: "Kunstraum Baden", id: "kunstraum-baden", href: "projects/kunstraum-baden/", image: "assets/kunstraum-baden.webp", year: 2025 },
        { title: "Regionale 26", id: "regionale-26", href: "projects/regionale-26/", image: "assets/regionale-26.webp", year: 2026, ready: true },
        { title: "Humanico", id: "humanico", href: "projects/humanico/", image: "assets/humanico.webp", year: 2024 }
    ],

    Experiments: [
        { title: "Interactive Posters", id: "interactive-posters", href: "projects/interactive-posters/", image: "assets/interactive-posters.webp", year: 2025 },
        { title: "Clock Poster", id: "clock-poster", href: "projects/clock-poster/", image: "assets/clock-poster.webp", year: 2024 },
        { title: "Parking Ticket Business Card", id: "parking-ticket-business-card", href: "projects/parking-ticket-business-card/", image: "assets/parking-ticket-business-card.webp", year: 2023 }
    ],

    Research: [
        { title: "Books", id: "books", href: "projects/books/", image: "assets/books.webp", year: 2023 },
        { title: "About Publishing", id: "about-publishing", href: "projects/about-publishing/", image: "assets/about-publishing.webp", year: 2024 },
        { title: "Post-Poster", id: "post-poster", href: "projects/post-poster/", image: "assets/post-poster.webp", year: 2024 },
        { title: "Tracing the Arc", id: "tracing-the-arc", href: "projects/tracing-the-arc/", image: "assets/tracing-the-arc.webp", year: 2025 },
        { title: "Brutalist Photobooth", id: "brutalist-photobooth", href: "projects/brutalist-photobooth/", image: "assets/brutalist-photobooth.webp", year: 2025 },
        { title: "CMDS", id: "cmds", href: "projects/cmds/", image: "assets/cmds.webp", year: 2026 },
        { title: "Waves of 2021", id: "waves-of-2021", href: "projects/waves-of-2021/", image: "assets/waves-of-2021.webp", year: 2021 }
    ],

    Index: [] // filled in below, once every other category is defined
    };

    // Index = every project from every other category, tagged with
    // which category it came from so the "category" filter can group
    // by it.
   

function imageForProject(project) {
return project?.image || "";
}

function defaultImageForModule(name) {
  return moduleImages[name] || "";
}

  const HOVER_GROW_H = 220; // px added to a hovered module's height
  const HOVER_GROW_W = 118; // px added to width — one grid-column span

  const stage = document.getElementById("stage");
  const bgLayer = document.getElementById("bgLayer");
  const stateIndicator = document.getElementById("stateIndicator");
  const logoEl = document.getElementById("logo");
  const passInput = document.getElementById("passInput");
  const layoutNames = Object.keys(menuLayouts);

  let currentIndex = 0;
  let wheelTotal = 0;
  let inputLocked = false;
  let hoveredName = null;

  // ---- access-code gate ---------------------------------------------
  // Scrolling/rotating the layout always works, unlocked or not —
  // only hover interactions (module expand, background reveal,
  // project links, navigation) are gated behind the code. Clicking
  // anywhere before the code is entered reveals the input in place
  // of the logo instead of doing whatever was actually clicked.
  let unlocked = false;

  function showPassInput() {
    logoEl.style.display = "none";
    passInput.style.display = "block";
    passInput.value = "";
    passInput.focus();
  }

  function hidePassInput() {
    passInput.style.display = "none";
    logoEl.style.display = "";
  }

  function rejectCode() {
    passInput.value = "";
    passInput.classList.add("is-shaking");
    window.setTimeout(() => passInput.classList.remove("is-shaking"), 300);
  }

  passInput.addEventListener("input", () => {
    passInput.value = passInput.value.toUpperCase();
    if (passInput.value.length < 4) return;

    if (passInput.value === PASSCODE) {
      unlocked = true;
      hidePassInput();
    } else {
      rejectCode();
    }
  });

  passInput.addEventListener("click", (e) => e.stopPropagation());

  // capture phase so this runs before a module's own <a href> click
  document.addEventListener(
    "click",
    (e) => {
      if (unlocked) return;
      if (e.target === passInput) return;
      e.preventDefault();
      e.stopPropagation();
      showPassInput();
    },
    true
  );

  const moduleElements = {};

  // Builds one <li> — a normal underline-on-hover link for projects
  // with `ready: true`, or a non-navigating item that shows "Case
  // study coming soon" on hover instead, for everything else.
  function buildProjectItem(project, moduleName) {
    const li = document.createElement("li");
    li.className = "module__projects-item";

    const a = document.createElement("a");
    a.id = `project-${project.id}`;
    a.dataset.project = project.id;
    a.textContent = project.title;

    if (project.ready) {
      a.href = project.href;
    } else {
      a.href = "#";
      a.className = "is-unready";
      a.setAttribute("aria-disabled", "true");
      a.addEventListener("click", (e) => e.preventDefault());

      const note = document.createElement("span");
      note.className = "module__projects-note";
      note.textContent = "Coming soon";
      li.appendChild(note);
    }

    a.addEventListener("mouseenter", () => {
      if (!unlocked) return;
      setBackground(imageForProject(project));
    });
    a.addEventListener("mouseleave", () => {
      if (!unlocked) return;
      if (hoveredName === moduleName) setBackground(defaultImageForModule(moduleName));
    });

    li.prepend(a);
    return li;
  }

  function buildProjectList(projects, moduleName) {
    const list = document.createElement("ul");
    list.className = "module__projects";
    projects.forEach((project) => list.appendChild(buildProjectItem(project, moduleName)));
    return list;
  }

  // Index gets a filter bar (Year / A–Z / Category) above its list —
  // clicking a filter re-sorts and rebuilds the list in place.
  function buildIndexFilters(listContainer) {
    const bar = document.createElement("div");
    bar.className = "module__filters";

    const options = [
      { key: "year", label: "Year" },
      { key: "alpha", label: "A–Z" },
      { key: "category", label: "Category" }
    ];

    let activeKey = "year";
    const buttons = {};

    function applySort(key) {
      activeKey = key;
      Object.entries(buttons).forEach(([k, btn]) => btn.classList.toggle("is-active", k === key));
      const sorted = indexSorters[key](projectsByModule.Index);
      listContainer.replaceChildren(...buildProjectList(sorted, "Index").children);
    }

    options.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.addEventListener("click", () => applySort(key));
      buttons[key] = btn;
      bar.appendChild(btn);
    });

    applySort(activeKey);
    return bar;
  }

  function createModules() {
    const firstLayout = menuLayouts[layoutNames[0]];

    Object.keys(firstLayout.modules).forEach((name) => {
      const link = document.createElement("a");
      link.className = "module";
      link.dataset.module = name;
      link.href = "#" + name.toLowerCase();

      const label = document.createElement("span");
      label.className = "module__label";
      label.textContent = labels[name] || name;

      const body = document.createElement("div");
      body.className = "module__body";

      const desc = document.createElement("p");
      desc.className = "module__desc";
      desc.textContent = descriptions[name] || "";
      body.appendChild(desc);

      const projects = projectsByModule[name] || [];
      if (projects.length) {
        if (name === "Index") {
          const list = document.createElement("ul");
          list.className = "module__projects";
          body.appendChild(buildIndexFilters(list));
          body.appendChild(list);
        } else {
          body.appendChild(buildProjectList(projects, name));
        }
      }

      link.appendChild(label);
      link.appendChild(body);
      stage.appendChild(link);
      moduleElements[name] = link;

      link.addEventListener("mouseenter", () => {
        if (!unlocked) return;
        hoveredName = name;
        setBackground(defaultImageForModule(name));
        render(currentIndex);
      });
      link.addEventListener("mouseleave", () => {
        if (!unlocked) return;
        if (hoveredName === name) {
          hoveredName = null;
          setBackground(null);
        }
        render(currentIndex);
      });
    });
  }

  // Same grid convention as the project pages: 20px margin, 15px
  // gap, 12 columns. Used to pick a random left offset for the hover
  // image — but only among columns where the image's actual
  // rendered width (known only once it's loaded) keeps the whole
  // thing on-screen, so it never gets clipped off the right edge.
  const HOVER_GRID_MARGIN = 20;
  const HOVER_GRID_GAP = 15;
  const HOVER_GRID_COLS = 12;

  function positionBgImage() {
    if (!bgImg || !bgImg.naturalWidth || !bgImg.naturalHeight) return;

    const vw = window.innerWidth;
    // CSS (max-height/max-width: 100%) already guarantees the image
    // fits within the window on both axes — read its actual rendered
    // width rather than assuming height always equals the full
    // viewport, since a tall/narrow image may now be width-bound
    // instead of height-bound.
    const renderedWidth = bgImg.getBoundingClientRect().width;

    const usableWidth = vw - 2 * HOVER_GRID_MARGIN;
    const colWidth = (usableWidth - (HOVER_GRID_COLS - 1) * HOVER_GRID_GAP) / HOVER_GRID_COLS;
    const maxLeftAllowed = vw - HOVER_GRID_MARGIN - renderedWidth;

    const validLefts = [];
    for (let col = 0; col < HOVER_GRID_COLS; col++) {
      const colLeft = HOVER_GRID_MARGIN + col * (colWidth + HOVER_GRID_GAP);
      if (colLeft <= maxLeftAllowed) validLefts.push(colLeft);
    }

    const left = validLefts.length
      ? validLefts[Math.floor(Math.random() * validLefts.length)]
      // wider than the window minus margins — no column keeps it
      // fully clear of both edges, so just clamp it fully in-bounds
      : Math.max(0, Math.min(HOVER_GRID_MARGIN, vw - renderedWidth));

    bgImg.style.left = left + "px";
  }

  let bgImg = null;

  function setBackground(url) {
    if (!url) {
      bgLayer.style.opacity = "0";
      return;
    }
    if (!bgImg) {
      bgImg = document.createElement("img");
      bgImg.className = "bg-layer__img";
      bgImg.alt = "";
      bgImg.addEventListener("load", positionBgImage);
      bgLayer.appendChild(bgImg);
    }
    bgImg.src = url;
    if (bgImg.complete && bgImg.naturalWidth) positionBgImage();
    bgLayer.style.opacity = "1";
  }

  window.addEventListener("resize", positionBgImage);

  // Growing the hovered module can make it overlap neighbours in the
  // same layout — push those away so everything stays connected
  // instead of overlapping. Only size/position of *other* modules
  // ever reacts to touching; the hovered module's own growth
  // direction is decided purely by where it sits in the canvas:
  // modules above center grow upward, modules below grow downward,
  // modules left of center grow left, modules right of center grow
  // right — so a top module never grows down into the row below it.
  function resolveHoverLayout(baseRects, hoverName, canvasWidth, canvasHeight) {
    const rects = {};
    Object.keys(baseRects).forEach((k) => (rects[k] = { ...baseRects[k] }));

    const rect = rects[hoverName];
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const growLeft = centerX < canvasWidth / 2;
    const growUp = centerY < canvasHeight / 2;

    rect.width += HOVER_GROW_W;
    rect.height += HOVER_GROW_H;
    if (growLeft) rect.x -= HOVER_GROW_W;
    if (growUp) rect.y -= HOVER_GROW_H;

    // separate any two overlapping rects by nudging the second one
    // away from the first, along whichever axis has less overlap
    function separate(a, b) {
      const overlapX =
        Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY =
        Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (overlapX <= 0 || overlapY <= 0) return;

      if (overlapX < overlapY) {
        b.x += b.x < a.x ? -overlapX : overlapX;
      } else {
        b.y += b.y < a.y ? -overlapY : overlapY;
      }
    }

    const names = Object.keys(rects);
    for (let pass = 0; pass < 6; pass++) {
      names.forEach((i) => {
        names.forEach((j) => {
          if (i === j || j === hoverName) return;
          separate(rects[i], rects[j]);
        });
      });
    }

    return rects;
  }

  function render(index) {
    const layoutName = layoutNames[index];
    const layout = menuLayouts[layoutName];

    const rects = (unlocked && hoveredName)
      ? resolveHoverLayout(layout.modules, hoveredName, DESIGN_WIDTH, DESIGN_HEIGHT)
      : layout.modules;

    for (const [name, rect] of Object.entries(rects)) {
      const el = moduleElements[name];

      el.style.left = rect.x + "px";
      el.style.top = rect.y + "px";
      el.style.width = rect.width + "px";
      el.style.height = rect.height + "px";
      el.classList.toggle("is-hovered", unlocked && name === hoveredName);
    }

    stage.dataset.layout = layoutName;
    stateIndicator.textContent = `${index + 1} / ${layoutNames.length}`;
  }

  function fitStageToViewport() {
    const scale = Math.min(
      window.innerWidth / DESIGN_WIDTH,
      window.innerHeight / DESIGN_HEIGHT
    );

    const renderedWidth = DESIGN_WIDTH * scale;
    const renderedHeight = DESIGN_HEIGHT * scale;
    const offsetX = (window.innerWidth - renderedWidth) / 2;
    const offsetY = (window.innerHeight - renderedHeight) / 2;

    stage.style.transform =
      `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }

  function changeState(direction) {
    if (inputLocked) return;

    inputLocked = true;
    hoveredName = null;
    setBackground(null);
    currentIndex =
      (currentIndex + direction + layoutNames.length) % layoutNames.length;

    render(currentIndex);

    window.setTimeout(() => {
      inputLocked = false;
    }, TRANSITION_LOCK_MS);
  }

  function onWheel(event) {
    event.preventDefault();

    if (inputLocked) return;

    wheelTotal += event.deltaY;

    if (Math.abs(wheelTotal) < WHEEL_THRESHOLD) return;

    changeState(wheelTotal > 0 ? 1 : -1);
    wheelTotal = 0;
  }

  function onKeyDown(event) {
    if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) {
      event.preventDefault();
      changeState(1);
    }

    if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      changeState(-1);
    }
  }

  // ---- intro roll -----------------------------------------------------
  // On load, spin through the layouts fast, then ease to a stop over
  // ~2s — a visual hint that the page is scrollable. Reuses the same
  // render() path as real scrolling, just driven by a timed sequence
  // instead of wheel input. Real input is locked out until it finishes
  // so a scroll mid-intro can't fight the animation.
  //
  // The module transition itself (--duration, 520ms by default) is
  // temporarily shortened for the intro. Without this, early steps
  // fired faster than a transition could finish, so each layout
  // change interrupted the previous one mid-motion — that's what
  // looked "weird", not the concept. Every delay below is kept
  // comfortably above the shortened duration so each step actually
  // completes before the next one starts.
  function introRoll() {
    const root = document.documentElement;
    const introDuration = 220; // ms — faster than the normal 520ms
    const restoreDuration = getComputedStyle(root).getPropertyValue("--duration").trim() || "520ms";
    const delays = [260, 280, 310, 360, 430, 520, 630];

    root.style.setProperty("--duration", introDuration + "ms");
    inputLocked = true;
    let i = 0;

    function step() {
      if (i >= delays.length) {
        root.style.setProperty("--duration", restoreDuration);
        inputLocked = false;
        return;
      }
      currentIndex = (currentIndex + 1) % layoutNames.length;
      render(currentIndex);
      window.setTimeout(step, delays[i]);
      i += 1;
    }

    step();
  }

  createModules();
  render(currentIndex);
  fitStageToViewport();
  introRoll();

  window.addEventListener("resize", fitStageToViewport);
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
})();