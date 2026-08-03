// index-page.js — renders the standalone Index / archive page.
// Reuses project.css's header/logo/menu system (and project.js's
// initSiteMenu, loaded alongside this file) so this page matches
// the project pages exactly; only the filter bar + listing below
// the header are specific to this page.

(() => {
  "use strict";

  if (typeof allProjects === "undefined" || typeof indexSorters === "undefined") {
    throw new Error(
      "projects-data.js did not load. Load it before index-page.js."
    );
  }
  if (typeof initSiteMenu !== "function") {
    throw new Error(
      "project.js did not load. Load it before index-page.js — this page reuses its logo + mega-menu."
    );
  }

  const root = document.getElementById("indexPage");

  // ---- fixed logo + shared mega-menu, same as every project page ----
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

  // ---- fixed header (same markup/classes as a project page's) -------
  const header = document.createElement("header");
  header.className = "project__header";

  const headerGrid = document.createElement("div");
  headerGrid.className = "project__header-grid";

  const name = document.createElement("p");
  name.className = "project__name";
  name.textContent = "Index";
  headerGrid.appendChild(name);

  const category = document.createElement("p");
  category.className = "project__category";
  category.textContent = "Complete Archive";
  headerGrid.appendChild(category);

  header.appendChild(headerGrid);
  document.body.insertBefore(header, root);

  function syncHeaderHeight() {
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }

  // ---- filter bar + listing ------------------------------------------
  const filterBar = document.createElement("div");
  filterBar.className = "index-filters";

  const count = document.createElement("span");
  count.className = "index-count";
  count.textContent = allProjects.length + " projects";

  const list = document.createElement("div");
  list.className = "index-list";

  const filters = [
    { key: "year", label: "Year" },
    { key: "alpha", label: "A–Z" },
    { key: "category", label: "Category" }
  ];

  const buttons = {};

  function buildRow(project) {
    const row = document.createElement("a");
    row.className = "index-row";
    row.href = project.ready ? project.href : "#";
    if (!project.ready) {
      row.classList.add("is-unready");
      row.setAttribute("aria-disabled", "true");
      row.addEventListener("click", (e) => e.preventDefault());
    }

    const title = document.createElement("span");
    title.className = "index-row__title";
    title.textContent = project.title;

    const cat = document.createElement("span");
    cat.className = "index-row__category";
    cat.textContent = project.category;

    const year = document.createElement("span");
    year.className = "index-row__year";
    year.textContent = project.year;

    const note = document.createElement("span");
    note.className = "index-row__note";
    note.textContent = project.ready ? "" : "Case study coming soon";

    row.appendChild(title);
    row.appendChild(cat);
    row.appendChild(year);
    row.appendChild(note);
    return row;
  }

  function applySort(key) {
    Object.entries(buttons).forEach(([k, btn]) => btn.classList.toggle("is-active", k === key));
    list.replaceChildren(...indexSorters[key](allProjects).map(buildRow));
  }

  filters.forEach(({ key, label }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => applySort(key));
    buttons[key] = btn;
    filterBar.appendChild(btn);
  });

  filterBar.appendChild(count);
  root.appendChild(filterBar);
  root.appendChild(list);

  applySort("year");
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);
})();