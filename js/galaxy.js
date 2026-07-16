(() => {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  canvas.className = "galaxy-field";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    mountGuestbook();
    return;
  }

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
  let satelliteSprites = [];
  let frame = 0;
  let frameHandle = 0;
  let lastPaint = 0;
  const motion = {
    reduced: motionQuery.matches,
    visible: !document.hidden,
    running: false,
    lowPower: false,
    frameInterval: 1000 / 30,
    starFloor: 92,
    starCeiling: 160,
    starDensity: 9000
  };

  function setQualityProfile() {
    const cores = Number(navigator.hardwareConcurrency || 8);
    const memory = Number(navigator.deviceMemory || 8);
    motion.lowPower = width < 760 || cores <= 4 || memory <= 4;
    motion.frameInterval = 1000 / (motion.lowPower ? 24 : 30);
    motion.starFloor = motion.lowPower ? 56 : 92;
    motion.starCeiling = motion.lowPower ? 94 : 160;
    motion.starDensity = motion.lowPower ? 15000 : 9000;
  }

  function buildStars() {
    const count = Math.min(
      motion.starCeiling,
      Math.max(motion.starFloor, Math.round((width * height) / motion.starDensity))
    );
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
    width = Math.max(1, bounds.width);
    height = Math.max(1, window.innerHeight);
    setQualityProfile();
    dpr = Math.min(window.devicePixelRatio || 1, motion.lowPower ? 1 : 1.5);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    paint(performance.now());
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

  function createSatelliteSprite(satellite) {
    const sprite = document.createElement("canvas");
    const spriteSize = 64;
    const center = spriteSize / 2;
    sprite.width = spriteSize;
    sprite.height = spriteSize;
    const spriteContext = sprite.getContext("2d");
    if (!spriteContext) return sprite;

    const glow = spriteContext.createRadialGradient(center, center, 0, center, center, 29);
    glow.addColorStop(0, satellite.tone);
    glow.addColorStop(.13, "rgba(230, 242, 255, .86)");
    glow.addColorStop(.44, "rgba(151, 185, 255, .22)");
    glow.addColorStop(1, "rgba(151, 185, 255, 0)");
    spriteContext.fillStyle = glow;
    spriteContext.beginPath();
    spriteContext.arc(center, center, 29, 0, Math.PI * 2);
    spriteContext.fill();

    spriteContext.fillStyle = "rgba(118, 161, 235, .76)";
    spriteContext.fillRect(7, center - 3, 18, 6);
    spriteContext.fillRect(39, center - 3, 18, 6);
    spriteContext.strokeStyle = "rgba(226, 240, 255, .48)";
    spriteContext.lineWidth = .7;
    spriteContext.strokeRect(7.5, center - 2.5, 17, 5);
    spriteContext.strokeRect(39.5, center - 2.5, 17, 5);
    spriteContext.fillStyle = "#edf6ff";
    spriteContext.beginPath();
    spriteContext.arc(center, center, 4.2, 0, Math.PI * 2);
    spriteContext.fill();
    spriteContext.fillStyle = "rgba(16, 40, 81, .92)";
    spriteContext.fillRect(center - 2.4, center - 2.4, 4.8, 4.8);
    return sprite;
  }

  function drawSatellite(cx, cy, radius, time, satellite, sprite) {
    const angle = satellite.phase + time * satellite.speed;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * .34;
    context.save();
    context.translate(x, y);
    context.rotate(angle + satellite.tilt);
    context.globalAlpha = .88;
    const size = satellite.size * 11;
    context.drawImage(sprite, -size / 2, -size / 2, size, size);
    context.restore();
  }

  function paint(time) {
    context.clearRect(0, 0, width, height);
    const shiftX = (pointer.x - .5) * 18;
    const shiftY = (pointer.y - .5) * 12;
    const galaxyGlow = context.createRadialGradient(width * .76, height * .17, 0, width * .76, height * .17, Math.max(width, height) * .55);
    galaxyGlow.addColorStop(0, "rgba(83, 129, 221, .16)");
    galaxyGlow.addColorStop(.5, "rgba(23, 75, 164, .05)");
    galaxyGlow.addColorStop(1, "rgba(7, 16, 31, 0)");
    context.fillStyle = galaxyGlow;
    context.fillRect(0, 0, width, height);

    frame = motion.reduced ? 0 : time * .001;
    stars.forEach((star) => {
      const x = star.x * width + shiftX * star.depth;
      const y = star.y * height + shiftY * star.depth;
      const pulse = motion.reduced ? 1 : .67 + Math.sin(frame * 1.55 + star.twinkle) * .33;
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
      drawSatellite(cx, cy, radius, time, satellite, satelliteSprites[index]);
    });
    context.globalAlpha = 1;
  }

  function stop() {
    motion.running = false;
    cancelAnimationFrame(frameHandle);
    frameHandle = 0;
  }

  function tick(time) {
    if (!motion.running) return;
    frameHandle = requestAnimationFrame(tick);
    if (time - lastPaint < motion.frameInterval) return;
    lastPaint = time;
    paint(time);
  }

  function start() {
    if (motion.reduced || !motion.visible || motion.running) return;
    motion.running = true;
    lastPaint = performance.now() - motion.frameInterval;
    frameHandle = requestAnimationFrame(tick);
  }

  document.addEventListener("pointermove", (event) => {
    if (motion.reduced) return;
    pointer.x = event.clientX / Math.max(width, 1);
    pointer.y = event.clientY / Math.max(height, 1);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    motion.visible = !document.hidden;
    if (motion.visible) {
      paint(performance.now());
      start();
    } else {
      stop();
    }
  });

  motionQuery.addEventListener?.("change", (event) => {
    motion.reduced = event.matches;
    stop();
    paint(performance.now());
    start();
  });

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

  satelliteSprites = satellites.map(createSatelliteSprite);
  window.addEventListener("resize", resize, { passive: true });
  resize();
  mountGuestbook();
  start();
})();
