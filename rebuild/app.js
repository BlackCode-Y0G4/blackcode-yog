const data = window.REFRAMED_DATA;
const fragments = window.REFRAMED_FRAGMENTS || {};
const app = document.getElementById("app");
const sidebar = document.getElementById("site-menu");
const sidebarEdge = document.querySelector(".meny-edge");
const sidebarContents = document.querySelector(".meny-contents");
const commentWidget = document.getElementById("comment-widget");

const navItems = [
  ["Collection", "/collection/", "collectionHover"],
  ["About", "/about/", "aboutHover"],
  ["BILIBILI", "https://space.bilibili.com/455053504", "bilibiliHover"],
  ["STEAM", "https://steamcommunity.com/id/YOGA2006/", "steamHover"],
];

const hoverTitles = {
  collectionHover: ["Collection", "Personal works grouped by folders"],
  aboutHover: ["About", "BLACKCODE manifesto"],
  bilibiliHover: ["BILIBILI", "BLACKCODE Presence on Bilibili"],
  steamHover: ["STEAM", "BLACKCODE Presence on Steam"],
};

const arrowLeftIcon = `<svg class="u-icon u-icon--arrow-left" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 0H0V9H9V0ZM2.73829 4.26017L4.06813 2.93033L3.72872 2.59092L1.81953 4.50011L3.72872 6.4093L4.06813 6.06989L2.73841 4.74017H6.89961V4.26017H2.73829Z"></path></svg>`;
const arrowRightIcon = `<svg class="u-icon u-icon--arrow-right" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 3.96585H7.91349L5.05089 1.09053L5.81425 0.314453L10 4.5002L5.81425 8.68596L5.05089 7.9226L7.91349 5.04728H0V3.96585Z"></path></svg>`;

let currentHover = "";
let aboutSlide = 1;
let cursorDown = false;
let currentPath = normalizePath(location.pathname);
let dragCleanup = null;
let scrollCleanup = null;
let sidebarPinned = false;

const commentConfig = {
  storageKey: "blackcode-yog-comments-v1",
  userKey: "blackcode-yog-comment-user-v1",
  adminPassword: "yujiayue1258",
  maxDaily: 10,
  maxLength: 400,
  autoDeleteMs: 90 * 24 * 60 * 60 * 1000,
  bannedWords: ["违法", "违规", "色情", "赌博", "诈骗", "毒品", "暴力", "傻逼", "fuck"],
};

let commentAdmin = false;

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

function setSidebar(open, pinned = sidebarPinned) {
  sidebarPinned = pinned;
  document.body.classList.toggle("meny-open", open);
  sidebar?.setAttribute("aria-hidden", String(!open));
  sidebarEdge?.setAttribute("aria-expanded", String(open));
  sidebarEdge?.setAttribute("aria-label", open ? "Close sidebar" : "Open sidebar");
}

function initSidebar() {
  if (!sidebar || !sidebarEdge || !sidebarContents) return;
  sidebarEdge.addEventListener("mouseenter", () => {
    if (matchMedia("(hover:hover)").matches) setSidebar(true, false);
  });
  sidebarEdge.addEventListener("click", () => {
    const isOpen = document.body.classList.contains("meny-open");
    setSidebar(isOpen && !sidebarPinned ? true : !isOpen, true);
  });
  sidebar.addEventListener("mouseenter", () => {
    if (matchMedia("(hover:hover)").matches) setSidebar(true, sidebarPinned);
  });
  sidebar.addEventListener("mouseleave", () => {
    if (matchMedia("(hover:hover)").matches && !sidebarPinned) setSidebar(false, false);
  });
  document.addEventListener("mouseleave", () => {
    if (!sidebarPinned) setSidebar(false, false);
  });
  sidebarContents.addEventListener("click", () => {
    if (document.body.classList.contains("meny-open")) setSidebar(false, false);
  });
  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      setSidebar(false, false);
      if (!href.startsWith("http")) {
        event.preventDefault();
        routeTo(href);
      }
    });
  });
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCommentStore() {
  const fallback = { comments: [], blocked: [], notice: "" };
  const store = readJson(commentConfig.storageKey, fallback);
  store.comments = Array.isArray(store.comments) ? store.comments : [];
  store.blocked = Array.isArray(store.blocked) ? store.blocked : [];
  store.notice = store.notice || "";
  return store;
}

function saveCommentStore(store) {
  writeJson(commentConfig.storageKey, store);
}

function getCommentUser() {
  let user = readJson(commentConfig.userKey, null);
  if (!user || !user.id) {
    user = { id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`, nickname: "" };
    writeJson(commentConfig.userKey, user);
  }
  return user;
}

function saveCommentUser(user) {
  writeJson(commentConfig.userKey, user);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function cleanComments(store) {
  const cutoff = Date.now() - commentConfig.autoDeleteMs;
  store.comments = store.comments.filter((comment) => comment.saved || comment.createdAt >= cutoff);
}

function sanitizeComment(text) {
  return text.replace(/[<>]/g, "").trim();
}

function hasSensitiveWord(text) {
  const lower = text.toLowerCase();
  return commentConfig.bannedWords.find((word) => lower.includes(word.toLowerCase()));
}

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]));
}

function formatCommentTime(timestamp) {
  return new Date(timestamp).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

async function syncCommentStore(store) {
  if (!window.BLACKCODE_COMMENT_API) return;
  try {
    await fetch(window.BLACKCODE_COMMENT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(store),
    });
  } catch {
    // Static fallback remains localStorage when no backend is available.
  }
}

function initComments() {
  if (!commentWidget) return;
  const toggle = commentWidget.querySelector(".comment-toggle");
  const sidebar = commentWidget.closest(".meny-sidebar");
  const panel = commentWidget.querySelector(".comment-panel");
  const input = commentWidget.querySelector(".comment-input");
  const anon = commentWidget.querySelector(".comment-anon");
  const count = commentWidget.querySelector(".comment-count");
  const status = commentWidget.querySelector(".comment-status");
  const send = commentWidget.querySelector(".comment-send");
  const list = commentWidget.querySelector(".comment-list");
  const nicknameBox = commentWidget.querySelector(".comment-nickname");
  const composeToggle = commentWidget.querySelector(".comment-compose-toggle");
  const compose = commentWidget.querySelector(".comment-compose");
  const adminToggle = commentWidget.querySelector(".comment-admin-toggle");
  const adminBox = commentWidget.querySelector(".comment-admin");
  const adminPassword = commentWidget.querySelector(".comment-admin-password");
  const adminLogin = commentWidget.querySelector(".comment-admin-login");
  const adminTools = commentWidget.querySelector(".comment-admin-tools");
  const notice = commentWidget.querySelector(".comment-notice");
  const noticeInput = commentWidget.querySelector(".comment-notice-input");
  const noticeSend = commentWidget.querySelector(".comment-notice-send");

  const setStatus = (message, tone = "") => {
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const updatePanelSpace = () => {
    if (panel.hidden) return;
    requestAnimationFrame(() => {
      const top = Math.ceil(panel.getBoundingClientRect().top);
      sidebar?.style.setProperty("--comment-panel-top", `${top}px`);
    });
  };

  const renderNickname = () => {
    const user = getCommentUser();
    nicknameBox.innerHTML = user.nickname
      ? `<span>昵称：${escapeHtml(user.nickname)}</span><button type="button" data-comment-action="rename">修改</button>`
      : `<button type="button" data-comment-action="rename">设置昵称后可署名评论</button>`;
  };

  const render = () => {
    const store = getCommentStore();
    cleanComments(store);
    saveCommentStore(store);
    renderNickname();
    adminTools.hidden = !commentAdmin;
    adminToggle.textContent = commentAdmin ? "退出YOG" : "YOG模式";
    adminToggle.setAttribute("aria-pressed", String(commentAdmin));
    if (commentAdmin) adminBox.hidden = true;
    notice.hidden = !store.notice;
    notice.textContent = store.notice;
    const sorted = [...store.comments].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
    list.innerHTML = sorted.length ? sorted.map((comment) => {
      const liked = (comment.likedBy || []).includes(getCommentUser().id);
      const replies = (comment.replies || []).map((reply) => `<div class="comment-reply"><strong>YOG</strong> ${escapeHtml(reply.text)}</div>`).join("");
      const adminActions = commentAdmin ? `
        <div class="comment-admin-actions">
          <button type="button" data-comment-action="pin" data-id="${comment.id}">${comment.pinned ? "取消顶置" : "顶置"}</button>
          <button type="button" data-comment-action="save" data-id="${comment.id}">${comment.saved ? "取消永久" : "永久保存"}</button>
          <button type="button" data-comment-action="reply" data-id="${comment.id}">回复</button>
          <button type="button" data-comment-action="block" data-user="${comment.userId}">拉黑</button>
          <button type="button" data-comment-action="delete" data-id="${comment.id}">删除</button>
        </div>` : "";
      return `
        <article class="comment-item ${comment.pinned ? "is-pinned" : ""}">
          <div class="comment-meta">
            <strong>${comment.pinned ? "PIN / " : ""}${escapeHtml(comment.author)}</strong>
            <span>${formatCommentTime(comment.createdAt)}</span>
          </div>
          <p>${escapeHtml(comment.text)}</p>
          ${replies}
          <button class="comment-like ${liked ? "is-liked" : ""}" type="button" data-comment-action="like" data-id="${comment.id}">LIKE ${comment.likes || 0}</button>
          ${adminActions}
        </article>`;
    }).join("") : `<p class="comment-empty">暂时还没有评论。</p>`;
    syncCommentStore(store);
  };

  toggle.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    commentWidget.classList.toggle("is-open", open);
    sidebar?.classList.toggle("has-comment-open", open);
    if (open) {
      render();
      updatePanelSpace();
    }
  });

  input.addEventListener("input", () => {
    count.textContent = `${input.value.length}/${commentConfig.maxLength}`;
  });

  nicknameBox.addEventListener("click", (event) => {
    if (event.target.dataset.commentAction !== "rename") return;
    const user = getCommentUser();
    const nickname = prompt("设置你的评论昵称", user.nickname || "");
    if (nickname == null) return;
    user.nickname = sanitizeComment(nickname).slice(0, 24);
    saveCommentUser(user);
    renderNickname();
  });

  send.addEventListener("click", () => {
    const store = getCommentStore();
    const user = getCommentUser();
    const text = sanitizeComment(input.value);
    const word = hasSensitiveWord(text);
    const dailyCount = store.comments.filter((comment) => comment.userId === user.id && comment.day === todayKey()).length;
    if (store.blocked.includes(user.id)) return setStatus("该用户已被拉黑，无法继续发送。", "bad");
    if (!text) return setStatus("请输入评论内容。", "bad");
    if (text.length > commentConfig.maxLength) return setStatus("每条评论最多400字。", "bad");
    if (word) return setStatus(`包含敏感词：${word}`, "bad");
    if (!user.nickname) return setStatus("第一次评论前请先设置昵称。", "bad");
    if (dailyCount >= commentConfig.maxDaily) return setStatus("今天已达到10条评论上限。", "bad");
    if (/\.(png|jpe?g|gif|webp|svg)\b/i.test(text)) return setStatus("评论区不可发送图片或图片链接。", "bad");
    store.comments.push({
      id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      userId: user.id,
      author: anon.checked ? "匿名访客" : user.nickname,
      anonymous: anon.checked,
      text,
      likes: 0,
      likedBy: [],
      replies: [],
      pinned: false,
      saved: false,
      day: todayKey(),
      createdAt: Date.now(),
    });
    saveCommentStore(store);
    input.value = "";
    count.textContent = `0/${commentConfig.maxLength}`;
    compose.hidden = true;
    composeToggle.setAttribute("aria-expanded", "false");
    setStatus("评论已发送。", "good");
    render();
    updatePanelSpace();
  });

  composeToggle.addEventListener("click", () => {
    const open = compose.hidden;
    compose.hidden = !open;
    composeToggle.setAttribute("aria-expanded", String(open));
    if (open) renderNickname();
    updatePanelSpace();
  });

  adminToggle.addEventListener("click", () => {
    if (commentAdmin) {
      commentAdmin = false;
      adminPassword.value = "";
      adminBox.hidden = true;
      setStatus("已退出YOG模式。");
      render();
      updatePanelSpace();
      return;
    }
    adminBox.hidden = !adminBox.hidden;
    updatePanelSpace();
  });

  adminLogin.addEventListener("click", () => {
    if (adminPassword.value === commentConfig.adminPassword) {
      commentAdmin = true;
      adminPassword.value = "";
      adminBox.hidden = true;
      setStatus("YOG模式已开启。", "good");
      render();
      updatePanelSpace();
    } else {
      setStatus("密码错误。", "bad");
    }
  });

  window.addEventListener("resize", updatePanelSpace);

  noticeSend.addEventListener("click", () => {
    const store = getCommentStore();
    store.notice = sanitizeComment(noticeInput.value).slice(0, 160);
    noticeInput.value = "";
    saveCommentStore(store);
    render();
  });

  list.addEventListener("click", (event) => {
    const action = event.target.dataset.commentAction;
    if (!action) return;
    const store = getCommentStore();
    const comment = store.comments.find((entry) => entry.id === event.target.dataset.id);
    if (action === "like" && comment) {
      const userId = getCommentUser().id;
      comment.likedBy = comment.likedBy || [];
      const index = comment.likedBy.indexOf(userId);
      if (index >= 0) {
        comment.likedBy.splice(index, 1);
      } else {
        comment.likedBy.push(userId);
      }
      comment.likes = comment.likedBy.length;
    }
    if (!commentAdmin) {
      saveCommentStore(store);
      return render();
    }
    if (action === "delete" && comment) store.comments = store.comments.filter((entry) => entry.id !== comment.id);
    if (action === "pin" && comment) comment.pinned = !comment.pinned;
    if (action === "save" && comment) comment.saved = !comment.saved;
    if (action === "block") store.blocked = [...new Set([...store.blocked, event.target.dataset.user])];
    if (action === "reply" && comment) {
      const reply = prompt("回复该评论");
      if (reply) comment.replies = [...(comment.replies || []), { text: sanitizeComment(reply).slice(0, 240), createdAt: Date.now() }];
    }
    saveCommentStore(store);
    render();
  });

  render();
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
        setHomeHover(hoverKey);
      }
    });
    link.addEventListener("mouseleave", () => {
      if (matchMedia("(hover:hover)").matches) {
        setHomeHover("");
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
  node.innerHTML = `${fragments.background || ""}${fragments.stars || ""}`;
  node.append(el("img", { class: "barcode-image", src: "/BLACKCODE.YOG.png", alt: "BLACKCODE.YOG barcode", width: "194", height: "36" }));
  return node;
}

function homeTitleSection(hoverKey = "") {
  if (hoverKey) {
    const [title, subtitle] = hoverTitles[hoverKey];
    const hoverTitle = el("h1", { class: "hero-title hover-word" });
    splitHeroTitle(hoverTitle, title, 0);
    const section = el("section", { class: "hover-title" }, [
      el("p", { class: "eyebrow" }, [subtitle]),
      hoverTitle,
    ]);
    scramble(hoverTitle);
    return section;
  }
  const title = el("h1", { class: "hero-title", onclick: () => routeTo("/about/") });
  splitHeroTitle(title, "BLACK CODE", 5);
  const section = el("section", { class: "hero" }, [
    el("p", { class: "eyebrow" }, ["GETTING"]),
    title,
  ]);
  scramble(title);
  return section;
}

function setHomeHover(hoverKey) {
  if (currentPath !== "/") return;
  if (currentHover === hoverKey) return;
  currentHover = hoverKey;
  document.body.classList.toggle("is-dark", !!currentHover);
  const view = document.querySelector("main.home");
  if (!view) return;
  view.querySelector(".hero, .hover-title")?.remove();
  view.insertBefore(homeTitleSection(currentHover), view.querySelector(".navigation"));
}

function home() {
  document.body.classList.toggle("is-dark", !!currentHover);
  const view = el("main", { class: "home page" });
  view.append(background());
  view.append(homeTitleSection(currentHover));
  view.append(nav());
  return view;
}

function splitHeroTitle(node, text, breakAfter = 4) {
  node.innerHTML = "";
  const isHeroTitle = text === "BLACK CODE" && breakAfter === 5;
  let currentLine = isHeroTitle ? el("span", { class: "hero-line" }) : node;
  if (isHeroTitle) node.append(currentLine);
  text.split("").forEach((char, index) => {
    if (breakAfter && index === breakAfter) {
      if (isHeroTitle) {
        currentLine = el("span", { class: "hero-line" });
        node.append(currentLine);
        if (char === " ") return;
      } else {
        node.append(document.createElement("br"));
      }
    }
    currentLine.append(el("span", { class: "char", "data-char": char, style: `--i:${index}` }, [char]));
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

function collection() {
  document.body.classList.remove("is-dark");
  const view = el("main", { class: "examples collection page" });
  view.append(background());
  view.append(nav());
  view.append(closeButton("/"));
  const viewport = el("section", { class: "examples-viewport" });
  const track = el("div", { class: "examples-track" });
  data.collections.forEach((item, index) => {
    const card = el("a", { class: "example-card", href: `/collection/${item.id}/`, "data-title": item.alt }, [
      el("span", { class: "example-index" }, [`${String(index + 1).padStart(2, "0")}. ${item.alt}`]),
      el("img", { src: item.src, alt: item.alt, width: item.width, height: item.height }),
      el("span", { class: "view-project", html: `${arrowRightIcon} View project` }),
    ]);
    card.style.maxWidth = `${item.width || 260}px`;
    card.addEventListener("click", (event) => {
      if (Math.abs(Number(track.dataset.dragDistance || 0)) > 6) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      routeTo(`/collection/${item.id}/`);
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
  const item = data.collections.find((entry) => entry.id === id);
  if (!item) return collection();
  document.body.classList.remove("is-dark");
  const view = el("main", { class: "detail page example-page" });
  view.append(background());
  view.append(nav());
  view.append(closeButton("/collection/"));
  view.append(el("div", { class: "detail-glass detail-glass-inspo" }));
  view.append(el("div", { class: "detail-glass detail-glass-output" }));
  const phaseTitle = el("h2", { class: "detail-phase-title" });
  setDetailTitle(phaseTitle, "WORKS");
  const titleLayer = el("section", { class: "detail-title-layer" }, [
    el("div", { class: "detail-title-inner" }, [
      phaseTitle,
      el("p", { class: "eyebrow detail-phase-subtitle" }, [item.alt]),
    ]),
  ]);
  const workCount = item.output.length;
  const density = workCount <= 2 ? "sparse" : workCount <= 4 ? "medium" : "dense";
  const container = el("section", { class: `detail-container collection-detail-container collection-${density}` }, [
    imageGrid("output", collectionLayoutItems(item.output), { collection: true }),
  ]);
  container.style.setProperty("--work-count", workCount);
  container.style.setProperty("--collection-rows", Math.max(workCount <= 2 ? 3.5 : workCount <= 4 ? 5 : 9, workCount * 1.45));
  const social = el("section", { class: "social detail-social" }, [
    el("p", { class: "eyebrow" }, ["Want to find out more?"]),
    el("div", { class: "social-links" }),
  ]);
  item.social.forEach((s) => social.querySelector(".social-links").append(el("a", { href: s.url, target: "_blank", rel: "noopener" }, [s.name + " ↗"])));
  view.append(titleLayer);
  view.append(container);
  view.append(scrollPeek(item.output.find((img) => img.src)));
  view.append(social);
  view.append(cursor("Enlarge"));
  window.setTimeout(() => {
    if (document.body.contains(view) && window.scrollY < 12) {
      view.classList.add("title-settled", "is-scroll-peek-ready");
    }
  }, 2450);
  requestAnimationFrame(() => initCollectionScroll(view, titleLayer, item.alt));
  return view;
}

function scrollPeek(img) {
  const peek = el("div", { class: "scroll-peek", "aria-hidden": "true" });
  if (!img) return peek;
  peek.style.setProperty("--peek-image-width", `${Math.min(img.width || 320, 560)}px`);
  const inner = el("div", { class: "scroll-peek-inner" }, [
    el("img", { src: img.src, alt: "", width: img.width || 1, height: img.height || 1 }),
    el("p", {}, [img.alt || ""]),
  ]);
  peek.append(inner);
  return peek;
}

function imageGrid(title, items, options = {}) {
  const section = el("section", { class: `image-grid ${title}${options.collection ? " collection-grid" : ""}` }, [el("h2", {}, [title])]);
  const grid = el("div", { class: "grid" });
  items.forEach((img, index) => {
    const slot = el("article", { class: img.src ? `image-slot ${positionClass(img.position)}` : "image-slot empty" });
    slot.style.setProperty("--i", index + 1);
    if (title === "inspiration" && index < 5) {
      slot.dataset.revealShift = index === 1 ? "56" : index === 3 ? "79" : "60";
    }
    if (img.revealShift) {
      slot.dataset.revealShift = img.revealShift;
    }
    if (img.src) {
      slot.dataset.scrollMotion = "slide";
      slot.dataset.motionStrength = options.collection ? "100" : "100";
      const wrapper = el("div", { class: "image-wrapper" });
      if (options.collection) {
        wrapper.style.setProperty("--image-width", `${Math.min(img.width || 320, 560)}px`);
      } else {
        wrapper.style.maxWidth = `${img.width || 1}px`;
      }
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

function collectionLayoutItems(items) {
  const positions = [
    "top left",
    "bottom right",
    "top center",
    "left center",
    "bottom center",
    "top right",
    "center center",
    "bottom left",
    "right center",
  ];
  const spread = items.length <= 2 ? 5 : items.length <= 4 ? 3 : 3;
  const result = [];
  items.forEach((img, index) => {
    if (index > 0) {
      Array.from({ length: spread }).forEach(() => result.push({}));
    }
    result.push({
      ...img,
      position: positions[index % positions.length],
      revealShift: index % 2 ? "72" : "46",
    });
  });
  const tail = items.length <= 2 ? 1 : items.length <= 4 ? 2 : 4;
  Array.from({ length: tail }).forEach(() => result.push({}));
  return result;
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
    updateImageSlideMotion(view, revealRest);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  scrollCleanup = () => {
    window.removeEventListener("scroll", update);
    scrollCleanup = null;
  };
}

function initCollectionScroll(view, titleLayer, label) {
  if (scrollCleanup) scrollCleanup();
  const update = () => {
    const y = window.scrollY;
    const socialStart = Math.max(1, view.scrollHeight - innerHeight * 1.5);
    const socialPhase = y > socialStart;
    document.body.classList.remove("is-dark");
    view.classList.remove("is-output");
    view.classList.toggle("has-scrolled", y > 12);
    titleLayer.classList.remove("is-output");
    titleLayer.classList.toggle("is-faded", socialPhase);
    const title = titleLayer.querySelector(".detail-phase-title");
    const titleInner = titleLayer.querySelector(".detail-title-inner");
    const subtitle = titleLayer.querySelector(".detail-phase-subtitle");
    titleInner.style.opacity = socialPhase ? "0" : String(Math.max(0.22, 1 - y / Math.max(1, innerHeight * 1.6)));
    setDetailTitle(title, "WORKS");
    subtitle.textContent = label;
    const revealRest = Math.max(0, 1 - y / Math.max(1, innerHeight * 0.9));
    updateImageSlideMotion(view, revealRest);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  scrollCleanup = () => {
    window.removeEventListener("scroll", update);
    scrollCleanup = null;
  };
}

function updateImageSlideMotion(view, revealRest = 0) {
  const viewport = Math.max(1, innerHeight || 1);
  const isCompact = innerWidth <= 1140;
  view.querySelectorAll(".image-slot").forEach((slot) => {
    const introShift = Number(slot.dataset.revealShift || 0) * revealRest;
    let scrollShift = 0;
    if (slot.dataset.scrollMotion === "slide" && !isCompact) {
      const rect = slot.getBoundingClientRect();
      const strength = Number(slot.dataset.motionStrength || 100);
      const rawProgress = (viewport - rect.top) / (viewport * 0.5 + Math.max(1, rect.height));
      const progress = clamp(rawProgress, 0, 1);
      scrollShift = (1 - easeInOutQuart(progress)) * strength;
    }
    const shift = Math.max(introShift, scrollShift);
    slot.style.transform = shift > 0.01 ? `translate3d(0, ${shift}%, 0)` : "";
  });
}

function easeInOutQuart(value) {
  const t = clamp(value, 0, 1);
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
    state.min = Math.min(0, viewport.clientWidth - track.scrollWidth);
    state.max = 0;
    state.x = clamp(state.x, state.min, state.max);
    setTrackX(track, state.x);
  };
  const stopMomentum = () => cancelAnimationFrame(state.raf);
  const onPointerDown = (event) => {
    const card = event.target.closest?.(".example-card");
    state.down = true;
    cursorDown = true;
    track.dataset.dragDistance = "0";
    track.dataset.pendingHref = card?.getAttribute("href") || "";
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
    const instant = (event.clientX - state.lastX) / dt;
    state.velocity = state.velocity * 0.8 + instant * 0.2;
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
    const throwVelocity = clamp(state.velocity, -0.6, 0.6);
    const target = clamp(state.x + throwVelocity * 650, state.min, state.max);
    const momentum = () => {
      state.x += (target - state.x) * 0.16;
      setTrackX(track, state.x);
      if (Math.abs(target - state.x) > 0.5) {
        state.raf = requestAnimationFrame(momentum);
      } else {
        state.x = target;
        setTrackX(track, state.x);
      }
    };
    momentum();
  };
  const onClick = (event) => {
    if (event.defaultPrevented) return;
    const card = event.target.closest?.(".example-card");
    const href = card?.getAttribute("href") || track.dataset.pendingHref || "";
    if (!href) return;
    if (Math.abs(Number(track.dataset.dragDistance || 0)) > 6) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    routeTo(href);
  };
  recalc();
  viewport.addEventListener("mouseenter", activateCursor);
  viewport.addEventListener("mouseleave", deactivateCursor);
  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);
  viewport.addEventListener("click", onClick);
  window.addEventListener("resize", recalc);
  dragCleanup = () => {
    stopMomentum();
    viewport.removeEventListener("mouseenter", activateCursor);
    viewport.removeEventListener("mouseleave", deactivateCursor);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", onPointerUp);
    viewport.removeEventListener("pointercancel", onPointerUp);
    viewport.removeEventListener("click", onClick);
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
  track.style.transform = `translate3d(${x}px, 0, 0)`;
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
    document.title = "BLACKCODE.YOG";
    app.append(home());
  } else if (currentPath === "/collection/" || currentPath === "/examples/") {
    document.title = "BLACKCODE.YOG";
    if (currentPath === "/examples/") history.replaceState(null, "", "/collection/");
    app.append(collection());
  } else if (currentPath === "/about/") {
    document.title = "BLACKCODE.YOG";
    app.append(about());
  } else if (currentPath.startsWith("/collection/") || currentPath.startsWith("/examples/")) {
    const id = currentPath.split("/")[2];
    const item = data.collections.find((entry) => entry.id === id);
    if (currentPath.startsWith("/examples/")) history.replaceState(null, "", `/collection/${id}/`);
    document.title = "BLACKCODE.YOG";
    app.append(detail(id));
  } else {
    document.title = "BLACKCODE.YOG";
    app.append(home());
  }
}

window.addEventListener("popstate", render);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    setSidebar(false, false);
  }
  if (event.key.toLowerCase() === "m" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    setSidebar(!document.body.classList.contains("meny-open"), true);
  }
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
initSidebar();
initComments();
render();
