const data = window.REFRAMED_DATA;
const fragments = window.REFRAMED_FRAGMENTS || {};
const app = document.getElementById("app");

const navItems = [
  ["Examples", "/examples/", "demosHover"],
  ["About", "/about/", "aboutHover"],
  ["SAVEE", "https://savee.it/reframed/", "saveeHover"],
  ["Instagram", "https://www.instagram.com/reframed.online/", "instagramHover"],
];

const hoverTitles = {
  demosHover: ["Examples", "Design Inspiration influences and outputs"],
  aboutHover: ["About", "Reframed manifesto"],
  saveeHover: ["SAVEE", "Reframed Presence on savee"],
  instagramHover: ["Instagram", "Reframed Presence on Instagram"],
};

const arrowLeftIcon = `<svg class="u-icon u-icon--arrow-left" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 0H0V9H9V0ZM2.73829 4.26017L4.06813 2.93033L3.72872 2.59092L1.81953 4.50011L3.72872 6.4093L4.06813 6.06989L2.73841 4.74017H6.89961V4.26017H2.73829Z"></path></svg>`;

let currentHover = "";
let aboutSlide = 1;
let cursorDown = false;
let currentPath = normalizePath(location.pathname);
let dragCleanup = null;
let scrollCleanup = null;

function normalizePath(path) {
  if (!path || path === "/index.html") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

function routeTo(path) {
  if (path.startsWith("http")) {
    window.open(path, "_blank", "noopener,noreferrer");
    return;
  }
  currentPath = normalizePath(path);
  history.pushState(null, "", currentPath);
  currentHover = "";
  render();
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value == null) return;
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value);
  });
  children.forEach((child) => node.append(child && child.nodeType ? child : document.createTextNode(child ?? "")));
  return node;
}

function nav() {
  const wrapper = el("nav", { class: "navigation production-nav" });
  navItems.forEach(([label, href, hoverKey], index) => {
    const outer = el("div", { class: index === 1 || index === 3 ? "u-text-right" : "" });
    const icon = href.startsWith("http") && fragments.arrowTopRight ? fragments.arrowTopRight : "";
    const link = el("a", { class: "navigation-link", href, target: href.startsWith("http") ? "_blank" : null }, [
      el("div", { class: "navigation-label" }, [
        el("span", { class: "navigation-label-text", html: label + icon }),
        el("span", { class: "navigation-label-overlay" }),
      ]),
    ]);
    link.addEventListener("click", (event) => {
      if (!href.startsWith("http")) event.preventDefault();
      routeTo(href);
    });
    link.addEventListener("mouseenter", () => {
      if (matchMedia("(hover:hover)").matches) {
        currentHover = hoverKey;
        document.body.classList.add("is-dark");
        render();
      }
    });
    link.addEventListener("mouseleave", () => {
      if (matchMedia("(hover:hover)").matches) {
        currentHover = "";
        document.body.classList.toggle("is-dark", currentPath.startsWith("/about") || currentPath.startsWith("/examples/") && currentPath !== "/examples/");
        render();
      }
    });
    link.style.setProperty("--i", index + 1);
    outer.append(link);
    wrapper.append(outer);
  });
  return wrapper;
}

function background({ dark = false } = {}) {
  const node = el("div", { class: `ambient production-ambient ${dark ? "ambient-dark" : ""}` });
  node.innerHTML = `${fragments.background || ""}${fragments.stars || ""}${fragments.barcode || ""}`;
  return node;
}

function home() {
  document.body.classList.toggle("is-dark", !!currentHover);
  const view = el("main", { class: "home page" });
  view.append(background());
  if (currentHover) {
    const [title, subtitle] = hoverTitles[currentHover];
    view.append(el("section", { class: "hover-title" }, [
      el("p", { class: "eyebrow" }, [subtitle]),
      el("h1", { class: "hero-title hover-word" }, [title]),
    ]));
  } else {
    const title = el("h1", { class: "hero-title", onclick: () => routeTo("/about/") });
    splitHeroTitle(title, "REFRAMED");
    view.append(el("section", { class: "hero" }, [
      el("p", { class: "eyebrow" }, ["GETTING"]),
      title,
    ]));
    scramble(title);
  }
  view.append(nav());
  return view;
}

function splitHeroTitle(node, text) {
  node.innerHTML = "";
  text.split("").forEach((char, index) => {
    if (index === 4) node.append(document.createElement("br"));
    node.append(el("span", { class: "char", "data-char": char }, [char]));
  });
}

function scramble(node) {
  const chars = Array.from(node.querySelectorAll(".char"));
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  chars.forEach((char) => {
    char.textContent = letters[Math.floor(Math.random() * letters.length)];
  });
  let tick = 0;
  const timer = setInterval(() => {
    tick += 1;
    chars.forEach((char, i) => {
      char.textContent = tick > 25 + i * 2 ? char.dataset.char : letters[Math.floor(Math.random() * letters.length)];
    });
    if (tick > 80) clearInterval(timer);
  }, 30);
}

function examples() {
  document.body.classList.remove("is-dark");
  const view = el("main", { class: "examples page" });
  view.append(background());
  view.append(nav());
  view.append(closeButton("/"));
  const viewport = el("section", { class: "examples-viewport" });
  const track = el("div", { class: "examples-track" });
  data.examples.forEach((item, index) => {
    const card = el("a", { class: "example-card", href: `/examples/${item.id}/` }, [
      el("span", { class: "example-index" }, [`${String(index + 1).padStart(2, "0")}. ${item.alt}`]),
      el("img", { src: item.src, alt: item.alt, width: item.width, height: item.height }),
      el("span", { class: "view-project" }, ["-> View project"]),
    ]);
    card.addEventListener("click", (event) => {
      if (Math.abs(Number(track.dataset.dragDistance || 0)) > 6) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      routeTo(`/examples/${item.id}/`);
    });
    track.append(card);
  });
  viewport.append(track);
  view.append(viewport);
  view.append(cursor("Drag"));
  requestAnimationFrame(() => initInertiaDrag(viewport, track));
  return view;
}

function closeButton(to) {
  const close = el("a", { class: "close", href: to, html: arrowLeftIcon });
  close.addEventListener("click", (event) => { event.preventDefault(); routeTo(to); });
  return close;
}

function about() {
  document.body.classList.add("is-dark");
  const view = el("main", { class: "about page" });
  view.append(background({ dark: true }));
  view.append(nav());
  view.append(closeButton("/"));
  const slide = data.about.slides.find((item) => item.id === aboutSlide) || data.about.slides[0];
  const content = el("section", { class: "about-panel" }, [
    el("div", { class: "about-copy", html: slide.text }),
    el("div", { class: "about-actions" }),
  ]);
  slide.actions.forEach((action) => {
    const button = el("button", { class: "button inverted" }, [action.label]);
    button.addEventListener("click", () => {
      if (typeof action.goto === "number") {
        aboutSlide = action.goto;
        render();
      } else {
        routeTo(action.goto);
      }
    });
    content.querySelector(".about-actions").append(button);
  });
  view.append(content);
  return view;
}

function detail(id) {
  const item = data.examples.find((entry) => entry.id === id);
  if (!item) return examples();
  document.body.classList.remove("is-dark");
  const view = el("main", { class: "detail page example-page" });
  view.append(background());
  view.append(nav());
  view.append(closeButton("/examples/"));
  view.append(el("div", { class: "detail-glass detail-glass-inspo" }));
  view.append(el("div", { class: "detail-glass detail-glass-output" }));
  const phaseTitle = el("h2", { class: "detail-phase-title" });
  setDetailTitle(phaseTitle, "INSPO");
  const titleLayer = el("section", { class: "detail-title-layer" }, [
    el("div", { class: "detail-title-inner" }, [
      phaseTitle,
      el("p", { class: "eyebrow detail-phase-subtitle" }, ["References that help build vision"]),
    ]),
  ]);
  const container = el("section", { class: "detail-container" }, [
    imageGrid("inspiration", item.inspiration),
    imageGrid("output", item.output),
  ]);
  const social = el("section", { class: "social detail-social" }, [
    el("p", { class: "eyebrow" }, ["Want to find out more?"]),
    el("div", { class: "social-links" }),
  ]);
  item.social.forEach((s) => social.querySelector(".social-links").append(el("a", { href: s.url, target: "_blank", rel: "noopener" }, [s.name + " ↗"])));
  view.append(titleLayer);
  view.append(container);
  view.append(social);
  view.append(cursor("Enlarge"));
  requestAnimationFrame(() => initDetailScroll(view, titleLayer));
  return view;
}

function imageGrid(title, items) {
  const section = el("section", { class: `image-grid ${title}` }, [el("h2", {}, [title])]);
  const grid = el("div", { class: "grid" });
  items.forEach((img, index) => {
    const slot = el("article", { class: img.src ? `image-slot ${positionClass(img.position)}` : "image-slot empty" });
    slot.style.setProperty("--i", index + 1);
    if (title === "inspiration" && index < 5) {
      slot.dataset.revealShift = index === 1 ? "56" : index === 3 ? "79" : "60";
    }
    if (img.src) {
      const wrapper = el("div", { class: "image-wrapper" });
      wrapper.style.maxWidth = `${img.width || 1}px`;
      const image = el("img", { src: img.src, alt: img.alt || "", width: img.width || 1, height: img.height || 1 });
      image.addEventListener("click", () => openLightbox(img));
      image.addEventListener("mouseenter", activateCursor);
      image.addEventListener("mouseleave", deactivateCursor);
      wrapper.append(image);
      wrapper.append(el("p", {}, [img.alt || ""]));
      slot.append(wrapper);
    }
    grid.append(slot);
  });
  section.append(grid);
  return section;
}

function positionClass(position) {
  return {
    "top left": "tl",
    "top center": "tc",
    "top right": "tr",
    "right center": "rc",
    "bottom right": "br",
    "bottom center": "bc",
    "bottom left": "bl",
    "left center": "lc",
    "center center": "cc",
  }[position] || "";
}

function initDetailScroll(view, titleLayer) {
  if (scrollCleanup) scrollCleanup();
  const update = () => {
    const y = window.scrollY;
    const outputStart = Math.max(1, innerHeight * 2.1);
    const socialStart = Math.max(1, view.scrollHeight - innerHeight * 1.5);
    const outputPhase = y > outputStart;
    const socialPhase = y > socialStart;
    document.body.classList.toggle("is-dark", outputPhase);
    view.classList.toggle("is-output", outputPhase);
    titleLayer.classList.toggle("is-output", outputPhase);
    titleLayer.classList.toggle("is-faded", socialPhase);
    const title = titleLayer.querySelector(".detail-phase-title");
    const titleInner = titleLayer.querySelector(".detail-title-inner");
    const subtitle = titleLayer.querySelector(".detail-phase-subtitle");
    titleInner.style.opacity = socialPhase ? "0" : String(Math.max(0.22, 1 - y / Math.max(1, innerHeight * 1.6)));
    setDetailTitle(title, outputPhase ? "OUTPUT" : "INSPO");
    subtitle.textContent = outputPhase ? "Created concept" : "References that help build vision";
    const revealRest = Math.max(0, 1 - y / Math.max(1, innerHeight * 0.9));
    view.querySelectorAll("[data-reveal-shift]").forEach((slot) => {
      const shift = Number(slot.dataset.revealShift || 0) * revealRest;
      slot.style.transform = shift ? `translate3d(0, ${shift}%, 0)` : "";
    });
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  scrollCleanup = () => {
    window.removeEventListener("scroll", update);
    scrollCleanup = null;
  };
}

function setDetailTitle(node, text) {
  if (node.dataset.text === text) return;
  node.dataset.text = text;
  node.innerHTML = "";
  text.split("").forEach((char, index) => {
    node.append(el("span", { class: "char detail-char", "data-char": char, style: `--i:${index}` }, [char]));
  });
}

function cursor(label) {
  return el("div", { class: `cursor ${cursorDown ? "is-down" : ""}` }, [
    el("div", { class: "cursor-ring" }),
    el("span", {}, [label]),
  ]);
}

function initInertiaDrag(viewport, track) {
  if (dragCleanup) dragCleanup();
  const state = { down: false, startX: 0, x: 0, lastX: 0, lastTime: 0, velocity: 0, raf: 0, min: 0, max: 0 };
  const recalc = () => {
    state.min = Math.min(0, viewport.clientWidth - track.scrollWidth - viewport.clientWidth * 0.18);
    state.max = 0;
    state.x = clamp(state.x, state.min, state.max);
    setTrackX(track, state.x);
  };
  const stopMomentum = () => cancelAnimationFrame(state.raf);
  const onPointerDown = (event) => {
    state.down = true;
    cursorDown = true;
    track.dataset.dragDistance = "0";
    state.startX = event.clientX - state.x;
    state.lastX = event.clientX;
    state.lastTime = performance.now();
    stopMomentum();
    viewport.setPointerCapture?.(event.pointerId);
    document.querySelector(".cursor")?.classList.add("is-down");
  };
  const onPointerMove = (event) => {
    if (!state.down) return;
    const now = performance.now();
    const next = clamp(event.clientX - state.startX, state.min - 90, state.max + 90);
    const dt = Math.max(16, now - state.lastTime);
    state.velocity = (event.clientX - state.lastX) / dt;
    state.x = next;
    track.dataset.dragDistance = String(Number(track.dataset.dragDistance || 0) + Math.abs(event.clientX - state.lastX));
    state.lastX = event.clientX;
    state.lastTime = now;
    setTrackX(track, state.x);
  };
  const onPointerUp = (event) => {
    if (!state.down) return;
    state.down = false;
    cursorDown = false;
    viewport.releasePointerCapture?.(event.pointerId);
    document.querySelector(".cursor")?.classList.remove("is-down");
    const momentum = () => {
      state.velocity *= 0.94;
      state.x += state.velocity * 16;
      if (state.x > state.max) {
        state.x += (state.max - state.x) * 0.18;
        state.velocity *= 0.7;
      }
      if (state.x < state.min) {
        state.x += (state.min - state.x) * 0.18;
        state.velocity *= 0.7;
      }
      setTrackX(track, state.x);
      if (Math.abs(state.velocity) > 0.01 || state.x > state.max + 0.5 || state.x < state.min - 0.5) {
        state.raf = requestAnimationFrame(momentum);
      } else {
        state.x = clamp(state.x, state.min, state.max);
        setTrackX(track, state.x);
      }
    };
    momentum();
  };
  recalc();
  viewport.addEventListener("mouseenter", activateCursor);
  viewport.addEventListener("mouseleave", deactivateCursor);
  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("resize", recalc);
  dragCleanup = () => {
    stopMomentum();
    viewport.removeEventListener("mouseenter", activateCursor);
    viewport.removeEventListener("mouseleave", deactivateCursor);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", onPointerUp);
    viewport.removeEventListener("pointercancel", onPointerUp);
    window.removeEventListener("resize", recalc);
    dragCleanup = null;
  };
}

function activateCursor() {
  document.querySelector(".cursor")?.classList.add("is-active");
}

function deactivateCursor() {
  document.querySelector(".cursor")?.classList.remove("is-active", "is-down");
}

function setTrackX(track, x) {
  const y = innerWidth > 800 ? -26 : 0;
  track.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function openLightbox(img) {
  closeLightbox();
  const overlay = el("div", { class: "lightbox", role: "dialog", "aria-modal": "true" }, [
    el("button", { class: "lightbox-close", onclick: closeLightbox }, ["x"]),
    el("figure", { class: "lightbox-figure" }, [
      el("img", { src: img.src, alt: img.alt || "" }),
      el("figcaption", {}, [
        el("span", { class: "image-id" }, [img.id ? String(img.id) : ""]),
        el("strong", {}, [img.alt || ""]),
      ]),
    ]),
  ]);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeLightbox();
  });
  document.body.append(overlay);
  requestAnimationFrame(() => overlay.classList.add("is-open"));
}

function closeLightbox() {
  document.querySelector(".lightbox")?.remove();
}

function render() {
  if (dragCleanup) dragCleanup();
  if (scrollCleanup) scrollCleanup();
  closeLightbox();
  app.innerHTML = "";
  currentPath = normalizePath(location.pathname);
  if (currentPath === "/") {
    document.title = "Reframed \u2014 Digital inspiration Lab";
    app.append(home());
  } else if (currentPath === "/examples/") {
    document.title = "Reframed \u2014 Examples";
    app.append(examples());
  } else if (currentPath === "/about/") {
    document.title = "Reframed \u2014 About";
    app.append(about());
  } else if (currentPath.startsWith("/examples/")) {
    const id = currentPath.split("/")[2];
    const item = data.examples.find((entry) => entry.id === id);
    document.title = item ? `Reframed \u2014 ${item.alt}` : "Reframed \u2014 Examples";
    app.append(detail(id));
  } else {
    document.title = "Reframed \u2014 Digital inspiration Lab";
    app.append(home());
  }
}

window.addEventListener("popstate", render);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});
window.addEventListener("mousemove", (event) => {
  document.documentElement.style.setProperty("--mx", `${event.clientX - innerWidth / 2}px`);
  document.documentElement.style.setProperty("--my", `${event.clientY - innerHeight / 2}px`);
  document.documentElement.style.setProperty("--px", `${event.clientX}px`);
  document.documentElement.style.setProperty("--py", `${event.clientY}px`);
  const title = document.querySelector(".hero-title");
  if (title && !currentHover) {
    title.querySelectorAll(".char").forEach((char) => {
      const rect = char.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const blur = Math.min(10, Math.max(0, Math.hypot(dx, dy) * 0.02));
      char.style.filter = `blur(${blur}px)`;
    });
  }
  const cursorNode = document.querySelector(".cursor");
  if (cursorNode) cursorNode.style.transform = `translate3d(var(--mx), var(--my), 0)`;
});
window.addEventListener("mousedown", () => { cursorDown = true; document.querySelector(".cursor")?.classList.add("is-down"); });
window.addEventListener("mouseup", () => { cursorDown = false; document.querySelector(".cursor")?.classList.remove("is-down"); });
render();
