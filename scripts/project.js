// project.js — shared renderer for individual project pages, plus the
// site-wide mega-menu opened by hovering the fixed "0/1" logo.

// ---- site-wide navigation data ---------------------------------------
// Shared across every project page. `width` is how many of the 12
// grid columns a category needs (1 = header only, 2 = header +
// items, 3 = header + items + one nested group level). The widths
// sum to exactly 12 (1+2+3+3+2+1), so whatever order the categories
// are rendered in, they always tile the full 12 columns edge to
// edge — which is what makes the scroll-to-rotate feature below
// possible without ever leaving a gap or an overflow.
const SITE_MENU = [
  { label: "About", href: "/#about", width: 1 },

  {
    label: "Brand Identity",
    href: "/#brand-identity",
    width: 2,
    items: [
      { label: "Carnault", href: "/projects/carnault/" },
      { label: "Musuemsnacht Basel", href: "/projects/museumsnacht-basel/" },
      { label: "Aramiko", href: "/projects/aramiko/" },
      { label: "Architecture and Human Augmentation ETH Zürich", href: "/projects/aha/" },  
      { label: "Neueden"},
      { label: "Mach Schwarz", href: "/projects/mach-schwarz/" }
    ]
  },

  {
    label: "Website",
    href: "/#website",
    width: 3, // header + items + room for the wide item to expand into
    items: [
      { label: "Architecture and Human Augmentation ETH Zürich" },
      { label: "Carnault"},
      { label: "0pen:sense"},
      { label: "Archive 2025"}
    ]
  },

  {
    label: "Graphic",
    href: "/#graphic",
    width: 3, // header + direct items/group-labels + one nested level
    items: [
      { label: "Kunstraum Baden"},
      { label: "Regionale 2025 Haus Elektronisch Kunst Basel"}
    ],
    groups: [
      {
        label: "> Type design/lettering",
        items: [
          { label: "Humanico"},
          { label: "Alima Markt"},
          { label: "Negroni Kabar"},
          { label: "Shake Shack KR"},
          { label: "Flower KR"},
          { label: "2025 Blu Snake"},
          { label: "2026 Red Horse"}
        ]
      },
      {
        label: "> Media experiments",
        items: [
          { label: "Interactive Swiss Posters"},
          { label: "Clock Poster"},
          { label: "Park Here"},
          { label: "Throw, Break, Decode"}
        ]
      }
    ]
  },

  {
    label: "Research",
    href: "/#research",
    width: 2,
    items: [
      { label: "Post Poster"},
      { label: "About Publishing"},
      { label: "Tracing the Arc"},
      { label: "Brutalist Photobooth"},
      { label: "CMDS"}
    ]
  },

  { label: "Contact", href: "/#contact", width: 1 }
];

function menuLink(className, item) {
  const a = document.createElement("a");
  a.className = className;

  if (item.href) {
    a.href = item.href;
  } else {
    // no real page yet — grey, non-interactive, instead of the
    // normal black tag treatment
    a.href = "#";
    a.classList.add("is-unready");
    a.setAttribute("aria-disabled", "true");
    a.addEventListener("click", (e) => e.preventDefault());
  }

  a.textContent = item.label;
  return a;
}

// Builds one category's DOM (header + items + nested groups) and
// returns its state object. Called 3 times per category (once per
// duplicate copy in the track) — each copy is a fully independent
// set of elements so toggling a group in one copy never affects
// another copy of the same category sitting elsewhere in the track.
function buildCategory(category) {
  const wrapper = document.createElement("div");
  wrapper.className = "site-menu__category";
  wrapper.style.gridTemplateColumns = "repeat(" + category.width + ", 1fr)";

  const headerEl = menuLink("site-menu__category-title", category);
  wrapper.appendChild(headerEl);

  const col2Entries = [];
  const cat = { wrapper, headerEl, col2Entries, width: category.width };

  (category.items || []).forEach((item) => {
    const el = menuLink("site-menu__item", item);
    wrapper.appendChild(el);
    col2Entries.push({ el, wide: item.wide });
  });

  (category.groups || []).forEach((group) => {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "site-menu__group-title";
    toggle.textContent = group.label;
    toggle.setAttribute("aria-expanded", "false");
    wrapper.appendChild(toggle);

    const groupItemEls = group.items.map((item) => {
      const el = menuLink("site-menu__item site-menu__item--nested", item);
      wrapper.appendChild(el);
      return el;
    });

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      groupItemEls.forEach((el) => el.classList.toggle("is-open", !isOpen));
      relayoutCategory(cat);
    });

    col2Entries.push({ el: toggle, groupItems: groupItemEls });
  });

  relayoutCategory(cat);
  return cat;
}

// Assigns explicit grid-row/grid-column to everything inside one
// category's own isolated grid. Re-run on init and after every group
// toggle, since opening a group changes how much vertical space its
// column-2 siblings need to skip past.
function relayoutCategory(cat) {
  cat.headerEl.style.gridColumn = 1;
  cat.headerEl.style.gridRow = 1;

  let row = 1;
  cat.col2Entries.forEach((entry) => {
    // group-title "> label" buttons span 2 columns (col2 + col3);
    // items flagged `wide` start at the normal item column (col2,
    // same left edge as every other item) and extend to the last
    // column of their category. A grid item's max-width can never
    // exceed its own assigned column, so this has to be a real
    // grid-column span, not a CSS width trick.
    entry.el.style.gridColumn = entry.wide
      ? "2 / -1"
      : entry.groupItems
      ? "2 / span 2"
      : "2";
    entry.el.style.gridRow = row;
    row += 1;

    if (entry.groupItems) {
      const isOpen = entry.el.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        // land directly under the trigger label, one row below it
        entry.groupItems.forEach((itemEl, i) => {
          itemEl.style.gridColumn = 3;
          itemEl.style.gridRow = row + i;
        });
        row += entry.groupItems.length;
      }
    }
  });
}

const MENU_PERIOD_COLS = SITE_MENU.reduce((sum, c) => sum + c.width, 0); // 12
const TRACK_COPIES = 3; // enough buffer that rapid scrolling never runs out of pre-built content

function buildSiteMenu() {
  const overlay = document.createElement("nav");
  overlay.className = "site-menu";
  overlay.id = "siteMenu";
  overlay.setAttribute("aria-hidden", "true");

  const grid = document.createElement("div");
  grid.className = "site-menu__grid";

  const track = document.createElement("div");
  track.className = "site-menu__track";

  // 3 consecutive copies of the same fixed 6-category sequence —
  // the order never changes, only the track's translateX does.
  const allCategories = [];
  for (let copy = 0; copy < TRACK_COPIES; copy++) {
    SITE_MENU.forEach((category) => {
      const cat = buildCategory(category);
      track.appendChild(cat.wrapper);
      allCategories.push(cat);
    });
  }

  grid.appendChild(track);
  overlay.appendChild(grid);
  document.body.appendChild(overlay);
  return { overlay, grid, track, allCategories };
}

// Positions every wrapper once, left to right, in px — this never
// changes after a resize recomputes it. All movement afterward is
// the track's transform, not these values.
function layoutMenuStatic(menu) {
  const colWidth = menu.grid.getBoundingClientRect().width / 12;
  let col = 0;
  menu.allCategories.forEach((cat) => {
    cat.wrapper.style.left = col * colWidth + "px";
    cat.wrapper.style.width = cat.width * colWidth + "px";
    col += cat.width;
  });
  return colWidth;
}

// Scroll while the menu is open -> the whole track slides left (or
// right) by exactly the width of whichever category is currently at
// the leading edge. Because the track holds duplicated copies of the
// same sequence, the category "entering" from the right is always
// already there, pre-positioned — nothing pops in. After a full
// period (12 columns) has scrolled past, the offset is silently
// reset back by one period with no transition; since the content
// repeats every 12 columns, this reset is visually identical to not
// resetting at all.
function initMenuRotation(menu) {
  let colWidth = layoutMenuStatic(menu);
  let offsetCols = 0;
  let frontIndex = 0; // which SITE_MENU category is currently at the leading edge
  let wrapTimer = null;

  function applyTransform(animate) {
    menu.track.style.transition = animate ? "transform 500ms var(--ease, ease)" : "none";
    menu.track.style.transform = "translateX(" + -offsetCols * colWidth + "px)";
  }

  function scheduleWrapCheck() {
    clearTimeout(wrapTimer);
    wrapTimer = window.setTimeout(() => {
      if (offsetCols >= MENU_PERIOD_COLS) {
        offsetCols -= MENU_PERIOD_COLS;
        applyTransform(false);
      } else if (offsetCols <= -MENU_PERIOD_COLS) {
        offsetCols += MENU_PERIOD_COLS;
        applyTransform(false);
      }
    }, 520);
  }

  function step(direction) {
    if (direction > 0) {
      // slide left: front category exits left, next slides in from the right
      offsetCols += SITE_MENU[frontIndex].width;
      frontIndex = (frontIndex + 1) % SITE_MENU.length;
    } else {
      // slide right: reverse
      frontIndex = (frontIndex - 1 + SITE_MENU.length) % SITE_MENU.length;
      offsetCols -= SITE_MENU[frontIndex].width;
    }
    applyTransform(true);
    scheduleWrapCheck();
  }

  let wheelAccum = 0;
  const STEP = 120;
  menu.overlay.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      wheelAccum += e.deltaY;
      if (Math.abs(wheelAccum) < STEP) return;
      step(wheelAccum > 0 ? 1 : -1);
      wheelAccum = 0;
    },
    { passive: false }
  );

  window.addEventListener("resize", () => {
    colWidth = layoutMenuStatic(menu);
    applyTransform(false);
  });
}

// hover the logo -> open; hover the menu itself -> stay open;
// leave both -> close, with a short grace period so moving the
// mouse from the logo into the panel doesn't flicker-close it.
function initSiteMenu(logoEl) {
  const menu = buildSiteMenu();
  initMenuRotation(menu);
  let closeTimer = null;

  function open() {
    clearTimeout(closeTimer);
    menu.overlay.classList.add("is-open");
    menu.overlay.setAttribute("aria-hidden", "false");
    logoEl.classList.add("is-menu-open");
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      menu.overlay.classList.remove("is-open");
      menu.overlay.setAttribute("aria-hidden", "true");
      logoEl.classList.remove("is-menu-open");
    }, 150);
  }

  logoEl.addEventListener("mouseenter", open);
  logoEl.addEventListener("focus", open);
  logoEl.addEventListener("mouseleave", scheduleClose);
  logoEl.addEventListener("blur", scheduleClose);

  menu.overlay.addEventListener("mouseenter", () => clearTimeout(closeTimer));
  menu.overlay.addEventListener("mouseleave", scheduleClose);
}

// ---- project page renderer --------------------------------------------
function renderProject(data) {
  "use strict";

  const root = document.getElementById("project");
  if (!root) {
    throw new Error("renderProject: no #project element found in this page.");
  }

  // ---- fixed logo (center of viewport, home button + menu trigger) ----
  const logo = document.createElement("button");
  logo.type = "button";
  logo.className = "site-logo-fixed";
  logo.innerHTML = "0<br>1";
  logo.setAttribute("aria-label", "01 Studio — home and menu");
  logo.addEventListener("click", () => {
    window.location.href = "/";
  });
  document.body.appendChild(logo);
  initSiteMenu(logo);

  // ---- fixed header, aligned to the 12-col grid ------------------------
  const header = document.createElement("header");
  header.className = "project__header";

  const headerGrid = document.createElement("div");
  headerGrid.className = "project__header-grid";

  const name = document.createElement("p");
  name.className = "project__name";
  name.textContent = data.name;
  headerGrid.appendChild(name);

  const category = document.createElement("p");
  category.className = "project__category";
  category.textContent = data.category;
  headerGrid.appendChild(category);

  if (data.year) {
    const year = document.createElement("p");
    year.className = "project_year";
    year.textContent = data.year;
    headerGrid.appendChild(year);
  }

  if (data.info) {
    const info = document.createElement("div");
    info.className = "project__info";

    if (data.info.intro) {
      const intro = document.createElement("p");
      intro.className = "project__info-intro";
      intro.textContent = data.info.intro;
      info.appendChild(intro);
    }

    (data.info.sections || []).forEach((section) => {
      const label = document.createElement("p");
      label.className = "project__info-label";
      label.textContent = section.label;
      const text = document.createElement("p");
      text.className = "project__info-text";
      text.textContent = section.text;
      info.appendChild(label);
      info.appendChild(text);
    });

    headerGrid.appendChild(info);
  }

  header.appendChild(headerGrid);
  root.appendChild(header);

  // ---- gallery: plain 12-col grid ---------------------------------------
  const gallery = document.createElement("div");
  gallery.className = "project__gallery grid-12";

  function makeImg(item) {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || data.name;
    img.loading = "lazy";
    return img;
  }

  (data.blocks || []).forEach((block) => {
    const span = [4, 6, 12].includes(block.span) ? block.span : 12;
    const wrap = document.createElement("div");
    wrap.className = "g-block g-span-" + span;

    if (block.type === "composite") {
      wrap.classList.add("g-block--composite");
      wrap.appendChild(makeImg(block.base));

      if (block.overlay) {
        const o = block.overlay;
        const overlay = makeImg(o);
        overlay.className = "g-overlay";
        overlay.style.left = (o.left ?? 0) + "%";
        overlay.style.top = (o.top ?? 0) + "%";
        overlay.style.width = (o.width ?? 30) + "%";
        overlay.style.height = (o.height ?? 30) + "%";
        wrap.appendChild(overlay);
      }
    } else {
      wrap.appendChild(makeImg(block));
    }

    gallery.appendChild(wrap);
  });

  root.appendChild(gallery);

  // ---- footer / CTA ---------------------------------------------------
  if (data.footerNote || (data.footerLinks && data.footerLinks.length)) {
    const cta = document.createElement("footer");
    cta.className = "project__cta grid-12";

    const note = document.createElement("p");
    note.className = "project__cta-note";
    note.textContent = data.footerNote || "";
    cta.appendChild(note);

    if (data.footerLinks && data.footerLinks.length) {
      const ul = document.createElement("ul");
      ul.className = "project__cta-links";
      data.footerLinks.forEach((link) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.label;
        li.appendChild(a);
        ul.appendChild(li);
      });
      cta.appendChild(ul);
    }

    gallery.after(cta);
  }

  // ---- reveal on scroll -------------------------------------------------
  const revealables = gallery.querySelectorAll(".g-block");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }
}