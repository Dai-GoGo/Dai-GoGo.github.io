const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const searchOpeners = document.querySelectorAll("[data-search-open]");
const searchPanel = document.querySelector("[data-search-panel]");
const searchClose = document.querySelector("[data-search-close]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("is-solid", window.scrollY > 24 || !document.querySelector(".hero"));
}

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

menuToggle?.addEventListener("click", () => {
  const open = !mobilePanel?.classList.contains("open");
  mobilePanel?.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
});

mobilePanel?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobilePanel.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

function openSearch() {
  searchPanel?.classList.add("open");
  searchPanel?.setAttribute("aria-hidden", "false");
  window.setTimeout(() => searchInput?.focus(), 40);
}

function closeSearch() {
  searchPanel?.classList.remove("open");
  searchPanel?.setAttribute("aria-hidden", "true");
}

searchOpeners.forEach((button) => button.addEventListener("click", openSearch));
searchClose?.addEventListener("click", closeSearch);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSearch();
    mobilePanel?.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
});

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" })
  : null;

document.querySelectorAll("[data-reveal]").forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  if (revealObserver) {
    revealObserver.observe(node);
  } else {
    node.classList.add("is-visible");
  }
});

let searchEntries = [];

async function loadSearch() {
  if (!searchInput || !searchResults) return;

  try {
    const response = await fetch("/search.xml");
    const xml = await response.text();
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    searchEntries = Array.from(doc.querySelectorAll("entry")).map((entry) => ({
      title: entry.querySelector("title")?.textContent.trim() || "",
      url: entry.querySelector("url")?.textContent.trim() || "/",
      content: entry.querySelector("content")?.textContent.trim() || ""
    }));
  } catch (error) {
    searchResults.innerHTML = '<div class="search-result"><strong>搜索暂不可用</strong><p>本地索引没有成功加载，请稍后再试。</p></div>';
  }
}

function renderSearch(query) {
  if (!searchResults) return;
  const value = query.trim().toLowerCase();

  if (!value) {
    searchResults.innerHTML = '<div class="search-result"><strong>输入关键词开始检索</strong><p>可以搜索架构、GitHub Pages、复盘、工程实践等主题。</p></div>';
    return;
  }

  const keywords = value.split(/\s+/).filter(Boolean);
  const matches = searchEntries
    .map((entry) => {
      const haystack = `${entry.title} ${entry.content}`.toLowerCase();
      const title = entry.title.toLowerCase();
      const score = keywords.reduce((total, keyword) => {
        if (title.includes(keyword)) return total + 8;
        if (haystack.includes(keyword)) return total + 2;
        return total;
      }, entry.url.startsWith("/posts/") ? 3 : 0);
      return { ...entry, score, matched: keywords.every((keyword) => haystack.includes(keyword)) };
    })
    .filter((entry) => entry.matched)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 8);

  if (!matches.length) {
    searchResults.innerHTML = '<div class="search-result"><strong>没有匹配结果</strong><p>换一个关键词试试，比如：架构、归档、静态站。</p></div>';
    return;
  }

  searchResults.innerHTML = matches.map((entry) => `
    <a class="search-result" href="${entry.url}">
      <strong>${entry.title}</strong>
      <p>${entry.content.slice(0, 120)}${entry.content.length > 120 ? "..." : ""}</p>
    </a>
  `).join("");
}

searchInput?.addEventListener("input", (event) => renderSearch(event.target.value));
loadSearch().then(() => renderSearch(""));

function initNetworkCanvas() {
  const canvas = document.querySelector("[data-network-canvas]");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  let frame = 0;
  let frameHandle = 0;
  let lastPaint = 0;
  let running = false;
  let visible = !document.hidden;
  const lowPowerDevice = window.innerWidth < 760 || Number(navigator.hardwareConcurrency || 8) <= 4 || Number(navigator.deviceMemory || 8) <= 4;
  const frameInterval = 1000 / (lowPowerDevice ? 24 : 30);
  const pointer = { x: -9999, y: -9999, active: false };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = width < 760 ? 42 : (lowPowerDevice ? 62 : 76);
    points = Array.from({ length: count }, (_, index) => ({
      x: (index % 14) / 13,
      y: Math.floor(index / 14) / Math.max(1, Math.floor(count / 14)),
      phase: Math.random() * Math.PI * 2,
      size: 1.4 + Math.random() * 1.8
    }));
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(18, 57, 126, .72)";
    context.fillRect(0, 0, width, height);

    frame += reduceMotion ? 0 : 0.012;
    const projected = points.map((point, index) => {
      const wave = Math.sin(time * 0.00045 + point.phase + frame) * 22;
      let x = width * (0.12 + point.x * 0.78) + Math.cos(index) * 10;
      let y = height * (0.18 + point.y * 0.66) + wave;

      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (pointer.active && dist < 145) {
        const force = (1 - dist / 145) * 30;
        x += (dx / Math.max(dist, 1)) * force;
        y += (dy / Math.max(dist, 1)) * force;
      }

      return { x, y, size: point.size };
    });

    context.strokeStyle = "rgba(255,255,255,0.13)";
    context.lineWidth = 1;
    for (let index = 0; index < projected.length - 1; index += 1) {
      const current = projected[index];
      const next = projected[index + 1];
      if (Math.abs(current.x - next.x) > width * 0.2) continue;
      context.beginPath();
      context.moveTo(current.x, current.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    }

    context.fillStyle = "rgba(255,255,255,0.88)";
    projected.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fill();
    });

    const labels = ["ARCHIVE", "TRACE", "REVIEW", "SHIP", "WRITE"];
    context.font = `${width < 760 ? 10 : 12}px Consolas, monospace`;
    context.fillStyle = "rgba(255,255,255,0.58)";
    labels.forEach((label, index) => {
      const point = projected[(index * 13 + Math.floor(time * 0.00025)) % projected.length];
      context.fillText(label, point.x + 10, point.y - 10);
    });

  }

  function stop() {
    running = false;
    cancelAnimationFrame(frameHandle);
    frameHandle = 0;
  }

  function tick(time) {
    if (!running) return;
    frameHandle = requestAnimationFrame(tick);
    if (time - lastPaint < frameInterval) return;
    lastPaint = time;
    draw(time);
  }

  function start() {
    if (reduceMotion || !visible || running) return;
    running = true;
    lastPaint = performance.now() - frameInterval;
    frameHandle = requestAnimationFrame(tick);
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    if (visible) {
      draw(performance.now());
      start();
    } else {
      stop();
    }
  });
  draw(0);
  start();
}

initNetworkCanvas();
