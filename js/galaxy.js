(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "galaxy-field";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const context = canvas.getContext("2d", { alpha: true });
  const pointer = { x: .5, y: .5 };
  const satellites = [
    { orbit: .21, speed: .00009, phase: .2, tilt: -.36, size: 3.1, tone: "#b7d3ff" },
    { orbit: .36, speed: -.000055, phase: 2.1, tilt: .58, size: 2.4, tone: "#8be1d3" },
    { orbit: .49, speed: .000038, phase: 4.2, tilt: -.15, size: 2.1, tone: "#e4c78e" }
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let frame = 0;

  function buildStars() {
    const count = Math.min(230, Math.max(105, Math.round((width * height) / 7800)));
    stars = Array.from({ length: count }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      radius: .35 + Math.random() * 1.5,
      alpha: .18 + Math.random() * .82,
      depth: .25 + Math.random() * .95,
      twinkle: Math.random() * Math.PI * 2,
      accent: index % 17 === 0
    }));
  }

  function resize() {
    const bounds = document.documentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, bounds.width);
    height = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function ellipse(cx, cy, rx, ry, rotation, stroke, alpha) {
    context.save();
    context.translate(cx, cy);
    context.rotate(rotation);
    context.strokeStyle = stroke;
    context.globalAlpha = alpha;
    context.lineWidth = .7;
    context.beginPath();
    context.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function drawSatellite(cx, cy, radius, time, satellite) {
    const angle = satellite.phase + time * satellite.speed;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * .34;
    const glow = context.createRadialGradient(x, y, 0, x, y, satellite.size * 6);
    glow.addColorStop(0, satellite.tone);
    glow.addColorStop(1, "rgba(151, 185, 255, 0)");
    context.globalAlpha = .56;
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, satellite.size * 6, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.translate(x, y);
    context.rotate(angle + satellite.tilt);
    context.globalAlpha = .92;
    context.fillStyle = satellite.tone;
    context.fillRect(-satellite.size / 2, -satellite.size / 2, satellite.size, satellite.size);
    context.fillStyle = "rgba(143, 181, 255, .7)";
    context.fillRect(-satellite.size * 2.3, -satellite.size / 3, satellite.size * 1.45, satellite.size * .68);
    context.fillRect(satellite.size * .85, -satellite.size / 3, satellite.size * 1.45, satellite.size * .68);
    context.restore();
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    const shiftX = (pointer.x - .5) * 18;
    const shiftY = (pointer.y - .5) * 12;
    const galaxyGlow = context.createRadialGradient(width * .76, height * .17, 0, width * .76, height * .17, Math.max(width, height) * .55);
    galaxyGlow.addColorStop(0, "rgba(83, 129, 221, .16)");
    galaxyGlow.addColorStop(.5, "rgba(23, 75, 164, .05)");
    galaxyGlow.addColorStop(1, "rgba(7, 16, 31, 0)");
    context.fillStyle = galaxyGlow;
    context.fillRect(0, 0, width, height);

    frame += reducedMotion ? 0 : .016;
    stars.forEach((star) => {
      const x = star.x * width + shiftX * star.depth;
      const y = star.y * height + shiftY * star.depth;
      const pulse = reducedMotion ? 1 : .67 + Math.sin(frame * 1.55 + star.twinkle) * .33;
      context.globalAlpha = star.alpha * pulse;
      context.fillStyle = star.accent ? "#cde0ff" : "#edf5ff";
      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    const cx = width * (.76 + (pointer.x - .5) * .025);
    const cy = height * (.33 + (pointer.y - .5) * .025);
    satellites.forEach((satellite, index) => {
      const radius = Math.min(width, height) * (satellite.orbit + index * .012);
      ellipse(cx, cy, radius, radius * .34, satellite.tilt, satellite.tone, .13 + index * .025);
      drawSatellite(cx, cy, radius, time, satellite);
    });

    if (!reducedMotion) requestAnimationFrame(draw);
  }

  document.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / Math.max(width, 1);
    pointer.y = event.clientY / Math.max(height, 1);
    document.documentElement.style.setProperty("--galaxy-pointer-x", `${pointer.x * 100}%`);
    document.documentElement.style.setProperty("--galaxy-pointer-y", `${pointer.y * 100}%`);
  }, { passive: true });

  function mountGuestbook() {
    if (window.location.pathname !== "/contact/" || document.querySelector(".guestbook-shell")) return;
    const main = document.querySelector("main");
    if (!main) return;

    const section = document.createElement("section");
    section.className = "section guestbook-section";
    section.innerHTML = `
      <div class="guestbook-head" data-reveal>
        <div><p class="eyebrow">Guestbook / public signal</p><h2>在这里留下你的信号。</h2></div>
        <p>留言会保存为 GitHub Issue，便于追踪、回复和长期保留。首次留言时需要登录 GitHub。</p>
      </div>
      <div class="guestbook-shell" data-reveal>
        <div class="guestbook-fallback"><strong>留言板正在连接 GitHub</strong><p>如果组件没有加载，也可以直接创建一条反馈 Issue。</p><a href="https://github.com/Dai-GoGo/Dai-GoGo.github.io/issues/new" target="_blank" rel="noopener noreferrer">前往 GitHub 留言 ↗</a></div>
      </div>`;
    main.append(section);
    section.querySelectorAll("[data-reveal]").forEach((node) => {
      node.classList.add("is-visible");
    });

    const comments = document.createElement("script");
    comments.src = "https://utteranc.es/client.js";
    comments.setAttribute("repo", "Dai-GoGo/Dai-GoGo.github.io");
    comments.setAttribute("issue-term", "pathname");
    comments.setAttribute("label", "guestbook");
    comments.setAttribute("theme", "github-dark");
    comments.setAttribute("crossorigin", "anonymous");
    comments.async = true;
    section.querySelector(".guestbook-shell")?.append(comments);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  mountGuestbook();
  draw(0);
})();
