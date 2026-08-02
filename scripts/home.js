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
        const projectsByModule = {
        About: [],

        Identity: [
            { title: "Carnault", id: "carnault", href: "projects/carnault/", image: "assets/carnault.png" },
            { title: "AHA", id: "aha", href: "projects/aha/", image: "assets/aha.webp" },
            { title: "Museumsnacht Basel", id: "museumsnacht-basel", href: "projects/museumsnacht-basel/", image: "assets/museumsnacht-basel.webp" },
            { title: "Neueden", id: "neueden", href: "projects/neueden/", image: "assets/neueden.webp" },
            { title: "Humanico", id: "humanico", href: "projects/humanico/", image: "assets/humanico.webp" },
            { title: "Mach Schwarz", id: "mach-schwarz", href: "projects/mach-schwarz/", image: "assets/mach-schwarz.webp" }
        ],

        Graphics: [
            { title: "Kunstraum Baden", id: "kunstraum-baden", href: "projects/kunstraum-baden/", image: "assets/kunstraum-baden.webp" },
            { title: "Regionale 26", id: "regionale-26", href: "projects/regionale-26/", image: "assets/regionale-26.webp" },
            { title: "Letterings / Type Design", id: "letterings-type-design", href: "projects/letterings-type-design/", image: "assets/letterings-type-design.webp" }
        ],

        Experiments: [
            { title: "Interactive Posters", id: "interactive-posters", href: "projects/interactive-posters/", image: "assets/interactive-posters.webp" },
            { title: "Clock Poster", id: "clock-poster", href: "projects/clock-poster/", image: "assets/clock-poster.webp" },
            { title: "Parking Ticket Business Card", id: "parking-ticket-business-card", href: "projects/parking-ticket-business-card/", image: "assets/parking-ticket-business-card.webp" }
        ],

        Research: [
            { title: "Books", id: "books", href: "projects/books/", image: "assets/books.webp" },
            { title: "About Publishing", id: "about-publishing", href: "projects/about-publishing/", image: "assets/about-publishing.webp" },
            { title: "Post-Poster", id: "post-poster", href: "projects/post-poster/", image: "assets/post-poster.webp" },
            { title: "Tracing the Arc", id: "tracing-the-arc", href: "projects/tracing-the-arc/", image: "assets/tracing-the-arc.webp" },
            { title: "Brutalist Photobooth", id: "brutalist-photobooth", href: "projects/brutalist-photobooth/", image: "assets/brutalist-photobooth.webp" },
            { title: "CMDS", id: "cmds", href: "projects/cmds/", image: "assets/cmds.webp" },
            { title: "Waves of 2021", id: "waves-of-2021", href: "projects/waves-of-2021/", image: "assets/waves-of-2021.webp" }
        ],

        Index: []
        };

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
      const layoutNames = Object.keys(menuLayouts);

      let currentIndex = 0;
      let wheelTotal = 0;
      let inputLocked = false;
      let hoveredName = null;

      const moduleElements = {};

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
            const list = document.createElement("ul");
            list.className = "module__projects";

            projects.forEach((project) => {
              const li = document.createElement("li");
              const a = document.createElement("a");
              a.href = project.href;
              a.id = `project-${project.id}`;
              a.dataset.project = project.id;
              a.textContent = project.title;

              a.addEventListener("mouseenter", () => {
                setBackground(imageForProject(project));
              });
              a.addEventListener("mouseleave", () => {
                if (hoveredName === name) setBackground(defaultImageForModule(name));
              });

              li.appendChild(a);
              list.appendChild(li);
            });

            body.appendChild(list);
          }

          link.appendChild(label);
          link.appendChild(body);
          stage.appendChild(link);
          moduleElements[name] = link;

          link.addEventListener("mouseenter", () => {
            hoveredName = name;
            setBackground(defaultImageForModule(name));
            render(currentIndex);
          });
          link.addEventListener("mouseleave", () => {
            if (hoveredName === name) {
              hoveredName = null;
              setBackground(null);
            }
            render(currentIndex);
          });
        });
      }

      function setBackground(url) {
        bgLayer.style.backgroundImage = url ? `url(${url})` : "";
        bgLayer.style.opacity = url ? "1" : "0";
      }

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

        const rects = hoveredName
          ? resolveHoverLayout(layout.modules, hoveredName, DESIGN_WIDTH, DESIGN_HEIGHT)
          : layout.modules;

        for (const [name, rect] of Object.entries(rects)) {
          const el = moduleElements[name];

          el.style.left = rect.x + "px";
          el.style.top = rect.y + "px";
          el.style.width = rect.width + "px";
          el.style.height = rect.height + "px";
          el.classList.toggle("is-hovered", name === hoveredName);
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

      createModules();
      render(currentIndex);
      fitStageToViewport();

      window.addEventListener("resize", fitStageToViewport);
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("keydown", onKeyDown);
    })();