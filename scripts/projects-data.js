// projects-data.js — single source of truth for every project, used
// by both the home page (hover previews) and the standalone Index
// page (the full listing with filters).
//
// `year` is a placeholder on every entry — none of this data had
// real years, so these are invented purely so the Index page's Year
// filter has something to sort by; replace with the actual dates.
// `ready: true` marks the handful of projects that have a real case
// study; everything else shows "Case study coming soon" instead of
// linking through — both the home page hover boxes and the Index
// page honor this the same way.

const projectsByModule = {
  About: [],

  Identity: [
    { title: "Carnault", id: "carnault", href: "projects/carnault/", image: "assets/carnault.png", year: 2026, ready: true },
    { title: "AHA", id: "aha", href: "projects/aha/", image: "assets/aha.webp", year: 2025, ready: true },
    { title: "Aramiko", id: "aramiko", href: "projects/aramiko/", image: "assets/aramiko.webp", year: 2025, ready: true },
    { title: "Museumsnacht Basel", id: "museumsnacht-basel", href: "projects/museumsnacht-basel/", image: "assets/museumsnacht-basel.webp", year: 2025, ready: true },
    { title: "Neueden", id: "neueden", href: "projects/neueden/", image: "assets/neueden.webp", year: 2024 },
    { title: "Mach Schwarz", id: "mach-schwarz", href: "projects/mach-schwarz/", image: "assets/mach-schwarz.webp", year: 2023, ready: true }
  ],

  Graphics: [
    { title: "Kunstraum Baden", id: "kunstraum-baden", href: "projects/kunstraum-baden/", image: "assets/kunstraum-baden.webp", year: 2025 },
    { title: "Regionale 26", id: "regionale-25", href: "projects/regionale-25/", image: "assets/regionale-25.webp", year: 2026, ready: true },
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

  // Index has no entries of its own here — it's a real page now
  // (index/index.html), not a hover-box list. See allProjects below.
  Index: []
};

// Flat list of every project, tagged with the category it came
// from — this is what the standalone Index page renders and filters.
const allProjects = [];
Object.keys(projectsByModule).forEach((moduleName) => {
  if (moduleName === "Index") return;
  projectsByModule[moduleName].forEach((project) => {
    allProjects.push({ ...project, category: moduleName });
  });
});

// sort orders the Index page's filter bar switches between
const indexSorters = {
  year: (list) => [...list].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)),
  alpha: (list) => [...list].sort((a, b) => a.title.localeCompare(b.title)),
  category: (list) => [...list].sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title))
};