const fs = require('fs');
const path = require('path');

const root = process.cwd();
const site = {
  name: 'Dai-GoGo 技术笔记',
  shortName: 'Dai-GoGo',
  url: 'https://dai-gogo.github.io',
  repo: 'https://github.com/Dai-GoGo/Dai-GoGo.github.io',
  description: '记录工程实践、架构思考与问题复盘。',
  year: '2026'
};

const nav = [
  ['首页', '/'],
  ['分类', '/categories/'],
  ['标签', '/tags/'],
  ['归档', '/archives/'],
  ['关于', '/about/'],
  ['资源', '/friends/'],
  ['留言', '/contact/']
];

const posts = [
  {
    slug: 'system-boundaries',
    title: '系统边界如何影响交付速度',
    date: '2026-07-02',
    category: '架构设计',
    tags: ['Architecture', 'Modularity', 'Delivery'],
    image: '/medias/featureimages/12.jpg',
    summary: '把模块边界、接口契约和团队协作放在同一张图里，能更快看见系统为什么变慢。',
    sections: [
      ['问题', '很多交付问题并不是编码速度不够，而是边界没有被明确表达。一个模块既承担业务规则，又承担数据适配，还顺手暴露给多个调用方时，后续每一次修改都会变成跨域协调。'],
      ['判断边界的三个信号', '第一，看变化原因是否一致；第二，看接口是否能用业务语言解释；第三，看故障影响是否能被限制在一个可理解的范围内。只要其中两个信号长期混乱，就应该重新讨论边界。'],
      ['落地方式', '不要从大重构开始。先用 ADR 记录当前边界假设，再为高频调用链补契约测试，最后把跨模块的数据结构改成显式 DTO。边界不是图画出来就结束，它需要被测试、日志和发布流程共同保护。']
    ]
  },
  {
    slug: 'github-pages-hardening',
    title: '把 GitHub Pages 做成可维护的静态发布链路',
    date: '2026-07-02',
    category: '工程实践',
    tags: ['GitHub Pages', 'Static Site', 'Deployment'],
    image: '/medias/featureimages/18.jpg',
    summary: '静态博客也需要发布纪律：目录 URL、搜索索引、站点地图和 404 页都属于基础设施。',
    sections: [
      ['为什么静态站也需要工程化', 'GitHub Pages 很容易上线，但容易被误解为只要有 HTML 就够了。真正稳定的静态站需要处理目录页、相对路径、搜索索引、RSS、站点地图和本地预览一致性。'],
      ['最小发布清单', '根目录保留 .nojekyll，避免 GitHub Pages 忽略下划线资源；所有目录链接使用尾斜杠；本地预览服务器要支持 /about 自动回落到 /about/index.html；搜索索引和 sitemap 在每次内容变更后同步生成。'],
      ['后续演进', '当文章数量增加后，可以把当前脚本升级为完整的内容构建器：Markdown 输入、模板输出、自动生成标签页和归档页。这样既保持静态站的轻量，也避免手写 HTML 的重复劳动。']
    ]
  },
  {
    slug: 'incident-review-template',
    title: '一次故障复盘模板应该保留什么信息',
    date: '2026-07-02',
    category: '问题复盘',
    tags: ['Review', 'SRE', 'Operations'],
    image: '/medias/featureimages/21.jpg',
    summary: '好的复盘不是追责文档，而是让下一次排查更快、影响更小、决策更清楚。',
    sections: [
      ['复盘的目标', '复盘的价值不在于把事故写完整，而在于提炼能改变系统行为的信息。时间线、影响面、触发条件、检测方式和修复动作必须能被后来的维护者复用。'],
      ['必须记录的字段', '建议保留五类信息：用户影响、系统信号、关键时间点、根因链路、后续动作。后续动作需要明确负责人、验证方式和截止时间，否则它只是愿望清单。'],
      ['模板之外的东西', '复盘还应该记录“当时为什么做出这个判断”。这些判断往往隐藏了监控缺口、权限瓶颈或团队知识断层，是下一轮工程改进最真实的入口。']
    ]
  }
];

const tracks = [
  ['架构设计', 'Architecture', '系统边界、模块职责、接口契约与技术选型。', '/categories/#architecture', 'visual-grid'],
  ['工程实践', 'Engineering', '工具链、自动化、代码质量和可维护性经验。', '/categories/#engineering', 'visual-lines'],
  ['问题复盘', 'Review', '线上问题、调试路径、根因分析和改进闭环。', '/categories/#review', 'visual-dots'],
  ['资料沉淀', 'Knowledge', '把临时经验整理成可以再次调用的知识资产。', '/archives/', 'visual-grid']
];

const resources = [
  ['GitHub Pages', '静态博客发布平台，适合个人技术站和文档站。', 'https://pages.github.com/'],
  ['Hexo', '快速生成静态内容的博客框架，后续可恢复为完整源码形态。', 'https://hexo.io/'],
  ['本站源码', '当前 GitHub Pages 仓库，用于追踪页面、资源和发布记录。', site.repo]
];

function write(file, content) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function anchorId(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '');
}

function absolute(url) {
  return `${site.url}${url}`;
}

function header() {
  const navLinks = nav.map(([label, href]) => `<a href="${href}">${label}</a>`).join('\n        ');
  return `
    <header class="site-header" data-header>
      <a class="brand" href="/" aria-label="${site.name}">
        <span class="brand-mark"></span>
        <span class="brand-text">${site.name}</span>
      </a>
      <nav class="nav" aria-label="主导航">
        ${navLinks}
      </nav>
      <div class="header-actions">
        <button class="icon-button" type="button" data-search-open aria-label="打开搜索">⌕</button>
        <a class="button" href="${site.repo}" target="_blank" rel="noopener noreferrer">
          <span>Star on GitHub <strong class="repo-star-count" data-star-count aria-live="polite"></strong></span>
          <span class="arrow-box"></span>
        </a>
        <button class="menu-toggle" type="button" data-menu-toggle aria-label="打开菜单" aria-expanded="false">
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
    <aside class="mobile-panel" data-mobile-panel>
      <nav aria-label="移动导航">
        ${navLinks}
      </nav>
      <p>${site.description} 当前版本采用 Cantor8-inspired 的蓝白视觉系统，并加入博客主题地图、归档和搜索。</p>
    </aside>
    <section class="search-panel" data-search-panel aria-hidden="true">
      <div class="search-box">
        <p class="eyebrow">Search</p>
        <div class="search-row">
          <input type="search" placeholder="搜索架构、复盘、GitHub Pages..." data-search-input>
          <button class="button" type="button" data-search-close>
            <span>关闭</span>
            <span class="arrow-box"></span>
          </button>
        </div>
        <div class="search-results" data-search-results></div>
      </div>
    </section>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div>
        <strong>${site.name}</strong><br>
        ${site.description}
      </div>
      <div class="footer-links">
        <a href="/atom.xml">RSS</a>
        <a href="/sitemap.xml">Sitemap</a>
        <a href="${site.repo}" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>`;
}

function layout({ title, description = site.description, body, pathName = '/' }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="Dai-GoGo, 技术博客, 架构设计, 工程实践, 问题复盘">
    <meta name="description" content="${description}">
    <link rel="canonical" href="${absolute(pathName)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${site.name}">
    <meta property="og:title" content="${title} | ${site.name}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${absolute(pathName)}">
    <meta property="og:image" content="${site.url}/medias/social-preview-moon.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title} | ${site.name}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${site.url}/medias/social-preview-moon.png">
    <title>${title} | ${site.name}</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="stylesheet" href="/css/cantor-blog.css">
    <script src="/js/cantor-blog.js" defer></script>
    <script src="/js/cosmic.js" defer></script>
    <script src="/js/galaxy.js" defer></script>
  </head>
  <body class="blog-shell">
${header()}
${body}
${footer()}
  </body>
</html>
`;
}

function button(label, href, blue = false) {
  return `<a class="button ${blue ? 'button-blue' : ''}" href="${href}">
    <span>${label}</span>
    <span class="arrow-box"></span>
  </a>`;
}

function postCard(post, dark = false) {
  return `
    <a class="story-card ${dark ? 'dark' : ''}" href="/posts/${post.slug}/" data-reveal>
      <div class="story-media">
        <img src="${post.image}" alt="${post.title}">
      </div>
      <div class="card-body">
        <div class="card-kicker"><span>${post.category} / ${post.date}</span><span class="card-arrow"></span></div>
        <h3>${post.title}</h3>
        <p>${post.summary}</p>
      </div>
    </a>`;
}

function trackCard(track, index) {
  const [title, label, text, href, visual] = track;
  return `
    <a class="track-card ${index % 2 === 0 ? 'dark' : ''}" href="${href}" data-reveal>
      <div class="abstract-visual ${visual}"></div>
      <div class="card-body">
        <div class="card-kicker"><span>${label}</span><span class="card-arrow"></span></div>
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
    </a>`;
}

function cta() {
  return `
    <section class="cta">
      <svg class="cta-lines" viewBox="0 0 1200 560" aria-hidden="true">
        <path d="M-30 170H240C255 170 265 180 265 195V295C265 310 275 320 290 320H570C585 320 595 330 595 345V455C595 470 605 480 620 480H1230"></path>
        <path d="M-30 240H180C195 240 205 250 205 265V400C205 415 215 425 230 425H455C470 425 480 415 480 400V255C480 240 490 230 505 230H800C815 230 825 240 825 255V340C825 355 835 365 850 365H1230"></path>
        <path class="pulse" d="M-30 170H240C255 170 265 180 265 195V295C265 310 275 320 290 320H570C585 320 595 330 595 345V455C595 470 605 480 620 480H1230"></path>
      </svg>
      <div class="cta-content" data-reveal>
        <p class="eyebrow blue">Build the writing system</p>
        <h2>把经验整理成下一次可以复用的答案。</h2>
        ${button('查看归档', '/archives/', true)}
      </div>
    </section>`;
}

function homePage() {
  const body = `
    <main>
      <section class="hero">
        <canvas class="network-canvas" data-network-canvas></canvas>
        <div class="cosmic-orbit cosmic-orbit-one" aria-hidden="true"></div>
        <div class="cosmic-orbit cosmic-orbit-two" aria-hidden="true"></div>
        <div class="hero-moon" aria-hidden="true"><span></span></div>
        <div class="hero-inner">
          <div class="hero-copy">
            <p class="eyebrow" data-reveal>Architecture / Engineering / Review</p>
            <h1 data-reveal>把复杂工程问题写成清晰的技术笔记。</h1>
            <div class="hero-summary" data-reveal>
              <p>${site.description} 这里不是展示模板的壳，而是一个用于持续沉淀架构判断、发布经验和复盘方法的个人知识系统。</p>
              ${button('阅读最新文章', '/archives/')}
            </div>
          </div>
          <aside class="hero-console" data-reveal>
            <div class="console-head"><span>WRITING STREAM</span><span>${site.year}</span></div>
            <div class="console-list">
              ${posts.map((post, index) => `
                <a class="console-item" href="/posts/${post.slug}/">
                  <span>0${index + 1}</span>
                  <span><strong>${post.title}</strong><small>${post.summary}</small></span>
                </a>`).join('')}
            </div>
          </aside>
        </div>
      </section>

      <section class="section section-white">
        <div class="section-grid">
          <div data-reveal>
            <p class="eyebrow blue">Why this blog exists</p>
            <div class="section-heading" style="display:block;margin:0;">
              <h2>不是记录所有事情，而是保留能再次产生判断力的东西。</h2>
            </div>
          </div>
          <div class="section-copy" data-reveal>
            技术博客最有价值的部分，不是“我今天做了什么”，而是“为什么这样做、后来证明哪里对、哪里错”。本站围绕三条线写作：架构边界、工程实践、问题复盘。
          </div>
        </div>
      </section>

      <section class="section mission-section">
        <div class="mission-grid">
          <div class="mission-copy" data-reveal>
            <p class="eyebrow">signal / orbit / open source</p>
            <h2>每一颗 Star，都是下一次继续探索的信号。</h2>
            <p>让真实的工程判断成为可以抵达、可以复用的坐标。移动鼠标，观察轨道对光的回应。</p>
            <a class="button button-blue" href="${site.repo}" target="_blank" rel="noopener noreferrer"><span>探索开源轨道</span><span class="arrow-box"></span></a>
          </div>
          <div class="signal-dial" data-reveal data-signal-dial aria-label="互动星图">
            <span class="dial-ring dial-ring-one"></span>
            <span class="dial-ring dial-ring-two"></span>
            <button class="signal-core" type="button" data-signal-button aria-pressed="false">点亮信号</button>
            <p data-signal-status>移动指针，寻找轨道中的微光。</p>
          </div>
        </div>
      </section>

      <section class="section section-blue">
        <div class="section-heading">
          <div>
            <p class="eyebrow" data-reveal>Topic map</p>
            <h2 data-reveal>像运维控制台一样管理知识主题。</h2>
          </div>
          <p class="section-copy" data-reveal>借用 Cantor8 的克制蓝白系统，把博客入口做成清晰的操作面板：每个主题都是一个长期维护的知识轨道。</p>
        </div>
        <div class="track-grid four">
          ${tracks.map(trackCard).join('')}
        </div>
      </section>

      <section class="section section-mist">
        <div class="section-heading">
          <div>
            <p class="eyebrow blue" data-reveal>Latest notes</p>
            <h2 data-reveal>三篇起步文章，先把博客真正跑起来。</h2>
          </div>
          <p class="section-copy" data-reveal>每篇文章都是真实页面，已经进入搜索、RSS、归档和站点地图。后续可以继续在脚本里扩展文章数据。</p>
        </div>
        <div class="story-grid">
          ${posts.map((post, index) => postCard(post, index === 1)).join('')}
        </div>
      </section>

      <section class="section section-white">
        <div class="metric-grid">
          <div class="metric-card" data-reveal><strong>${posts.length}</strong><span>篇起步文章</span></div>
          <div class="metric-card" data-reveal><strong>${new Set(posts.map(post => post.category)).size}</strong><span>个主题分类</span></div>
          <div class="metric-card" data-reveal><strong>${new Set(posts.flatMap(post => post.tags)).size}</strong><span>个标签入口</span></div>
          <div class="metric-card" data-reveal><strong>1</strong><span>套可持续生成的静态博客系统</span></div>
        </div>
      </section>
      ${cta()}
    </main>`;
  return layout({ title: '首页', body });
}

function categoriesPage() {
  const body = `
    <main>
      ${pageHero('分类', '按主题进入文章，而不是在长列表里迷路。', 'Categories')}
      <section class="section section-mist">
        <div class="track-grid four">
          ${tracks.map(trackCard).join('')}
        </div>
      </section>
      <section class="section section-white">
        <div class="content-list">
          ${['架构设计', '工程实践', '问题复盘'].map((category) => {
            const related = posts.filter(post => post.category === category);
            return `<div class="list-row" id="${category === '架构设计' ? 'architecture' : category === '工程实践' ? 'engineering' : 'review'}">
              <span class="article-meta">${category}</span>
              <div>
                <h3>${category}</h3>
                <p>${related.map(post => post.title).join(' / ')}</p>
              </div>
              ${button(`${related.length} 篇`, related[0] ? `/posts/${related[0].slug}/` : '/archives/', true)}
            </div>`;
          }).join('')}
        </div>
      </section>
    </main>`;
  return layout({ title: '分类', description: '按主题浏览 Dai-GoGo 技术笔记。', body, pathName: '/categories/' });
}

function tagsPage() {
  const tags = [...new Set(posts.flatMap(post => post.tags))].sort();
  const body = `
    <main>
      ${pageHero('标签', '用轻量标签串起跨主题的工程线索。', 'Tags')}
      <section class="section section-white">
        <div class="tag-cloud">
          ${tags.map(tag => `<a class="tag-chip" href="/archives/?tag=${encodeURIComponent(tag)}">${tag}</a>`).join('')}
        </div>
      </section>
      <section class="section section-mist">
        <div class="story-grid">
          ${posts.map(post => postCard(post)).join('')}
        </div>
      </section>
    </main>`;
  return layout({ title: '标签', description: '按标签浏览技术笔记。', body, pathName: '/tags/' });
}

function archivesPage() {
  const body = `
    <main>
      ${pageHero('归档', '按时间保存文章，也保存当时的判断。', 'Archive')}
      <section class="section section-white">
        <div class="content-list">
          ${posts.map(post => `<a class="list-row" href="/posts/${post.slug}/">
            <span class="article-meta">${post.date}</span>
            <div>
              <h3>${post.title}</h3>
              <p>${post.summary}</p>
            </div>
            <span class="tag-chip">${post.category}</span>
          </a>`).join('')}
        </div>
      </section>
    </main>`;
  return layout({ title: '归档', description: '按时间浏览已发布内容。', body, pathName: '/archives/' });
}

function aboutPage() {
  const body = `
    <main>
      ${pageHero(`关于 ${site.shortName}`, '这里是一个把工程经验变成可复用知识资产的个人技术站。', 'About')}
      <section class="section section-white">
        <div class="section-grid">
          <div data-reveal>
            <p class="eyebrow blue">Profile</p>
            <div class="section-heading" style="display:block;margin:0;"><h2>我关注系统如何被设计、交付、维护和复盘。</h2></div>
          </div>
          <div class="section-copy" data-reveal>
            当前站点先以静态 GitHub Pages 运行，重点是把视觉、导航、搜索、RSS、归档和文章详情这些博客基础能力建立起来。后续可以接入 Markdown 构建、评论系统和自定义域名。
          </div>
        </div>
      </section>
      <section class="section section-mist">
        <div class="metric-grid">
          <div class="metric-card" data-reveal><strong>ADR</strong><span>记录架构决策和取舍</span></div>
          <div class="metric-card" data-reveal><strong>CI</strong><span>关注发布链路和自动化</span></div>
          <div class="metric-card" data-reveal><strong>SRE</strong><span>沉淀故障处理与复盘</span></div>
          <div class="metric-card" data-reveal><strong>UX</strong><span>把技术内容组织得更易读</span></div>
        </div>
      </section>
      ${cta()}
    </main>`;
  return layout({ title: '关于', description: '关于站点作者、技术方向和内容规划。', body, pathName: '/about/' });
}

function friendsPage() {
  const body = `
    <main>
      ${pageHero('推荐资源', '保留和本站建设、静态发布、技术写作有关的资源。', 'Resources')}
      <section class="section section-mist">
        <div class="resource-grid">
          ${resources.map(([title, text, href], index) => `<a class="resource-card ${index === 1 ? 'dark' : ''}" href="${href}" target="_blank" rel="noopener noreferrer" data-reveal>
            <div class="abstract-visual ${index === 0 ? 'visual-grid' : index === 1 ? 'visual-lines' : 'visual-dots'}"></div>
            <div class="card-body">
              <div class="card-kicker"><span>Resource</span><span class="card-arrow"></span></div>
              <h3>${title}</h3>
              <p>${text}</p>
            </div>
          </a>`).join('')}
        </div>
      </section>
    </main>`;
  return layout({ title: '推荐资源', description: '收集与本站建设和工程实践相关的资源。', body, pathName: '/friends/' });
}

function contactPage() {
  const body = `
    <main>
      ${pageHero('留言板', '评论系统接入前，先使用 GitHub Issues 作为可靠反馈入口。', 'Contact')}
      <section class="section section-white">
        <div class="section-grid">
          <div data-reveal>
            <p class="eyebrow blue">Feedback loop</p>
            <div class="section-heading" style="display:block;margin:0;"><h2>有问题、建议或选题，可以直接开 Issue。</h2></div>
          </div>
          <div class="section-copy" data-reveal>
            GitHub Issues 比临时留言插件更适合当前阶段：可追踪、可关闭、可关联代码改动。后续如果需要，再接入评论系统或邮件订阅。
            <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
              ${button('创建 Issue', `${site.repo}/issues/new`, true)}
              ${button('查看源码', site.repo)}
            </div>
          </div>
        </div>
      </section>
    </main>`;
  return layout({ title: '留言板', description: '反馈问题、提出选题或联系站点维护者。', body, pathName: '/contact/' });
}

function pageHero(title, text, eyebrow) {
  return `
    <section class="page-hero">
      <div class="page-hero-inner">
        <div>
          <p class="eyebrow" data-reveal>${eyebrow}</p>
          <h1 data-reveal>${title}</h1>
        </div>
        <p data-reveal>${text}</p>
      </div>
    </section>`;
}

function articlePage(post) {
  const body = `
    <main>
      <article>
        <header class="article-header">
          <p class="eyebrow" data-reveal>${post.category} / ${post.date}</p>
          <h1 data-reveal>${post.title}</h1>
          <p data-reveal>${post.summary}</p>
        </header>
        <div class="article-body">
          <div class="article-layout">
            <div class="article-content">
              ${post.sections.map(([heading, content]) => `<h2 id="${anchorId(heading)}">${heading}</h2><p>${content}</p>`).join('\n')}
            </div>
            <aside class="article-panel">
              <h3>文章导航</h3>
              ${post.sections.map(([heading]) => `<a href="#${anchorId(heading)}">${heading}</a>`).join('')}
              <a href="/archives/">返回归档</a>
            </aside>
          </div>
        </div>
      </article>
      ${cta()}
    </main>`;
  return layout({ title: post.title, description: post.summary, body, pathName: `/posts/${post.slug}/` });
}

function notFoundPage() {
  const body = `
    <main>
      <section class="page-hero">
        <div class="page-hero-inner">
          <div>
            <p class="eyebrow" data-reveal>404</p>
            <h1 data-reveal>页面未找到</h1>
          </div>
          <p data-reveal>这个地址暂时没有对应内容。你可以回到首页，或从归档继续浏览。</p>
        </div>
      </section>
      <section class="section section-white">
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${button('返回首页', '/', true)}
          ${button('查看归档', '/archives/')}
        </div>
      </section>
    </main>`;
  return layout({ title: '页面未找到', description: '页面未找到。', body, pathName: '/404.html' });
}

function searchXml() {
  const entries = [
    ['首页', '/', site.description],
    ['分类', '/categories/', tracks.map(track => track[0]).join(' ')],
    ['标签', '/tags/', posts.flatMap(post => post.tags).join(' ')],
    ['归档', '/archives/', posts.map(post => post.title).join(' ')],
    ['关于', '/about/', '关于 Dai-GoGo 技术方向 架构 工程实践'],
    ['留言板', '/contact/', 'GitHub Issues 反馈 留言 联系'],
    ...posts.map(post => [post.title, `/posts/${post.slug}/`, `${post.summary} ${post.category} ${post.tags.join(' ')}`])
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<search>
${entries.map(([title, url, content]) => `  <entry>
    <title>${escapeXml(title)}</title>
    <url>${escapeXml(url)}</url>
    <content>${escapeXml(content)}</content>
  </entry>`).join('\n')}
</search>
`;
}

function atomXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(site.name)}</title>
  <link href="${site.url}/atom.xml" rel="self"/>
  <link href="${site.url}/"/>
  <updated>${posts[0].date}T00:00:00Z</updated>
  <id>${site.url}/</id>
  <author><name>${escapeXml(site.shortName)}</name></author>
  <subtitle>${escapeXml(site.description)}</subtitle>
${posts.map(post => `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${absolute(`/posts/${post.slug}/`)}"/>
    <id>${absolute(`/posts/${post.slug}/`)}</id>
    <updated>${post.date}T00:00:00Z</updated>
    <summary>${escapeXml(post.summary)}</summary>
  </entry>`).join('\n')}
</feed>
`;
}

function sitemapXml() {
  const urls = ['/', '/about/', '/categories/', '/tags/', '/archives/', '/contact/', '/friends/', ...posts.map(post => `/posts/${post.slug}/`)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${absolute(url)}</loc>
    <lastmod>${posts[0].date}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
}

function readme() {
  return `# ${site.name}

这是 \`Dai-GoGo.github.io\` 的 GitHub Pages 静态博客仓库。当前 UI 已重构为 Cantor8-inspired 的蓝白机构感视觉系统，并加入博客化的信息架构：主题轨道、文章详情、归档、标签、搜索、RSS 和 sitemap。

## 本地预览

\`\`\`powershell
node scripts\\static-server.js
\`\`\`

访问：

\`\`\`text
http://127.0.0.1:4000/
\`\`\`

## 生成整站

\`\`\`powershell
node scripts\\build-cantor-blog.js
\`\`\`

文章数据目前集中在 \`scripts/build-cantor-blog.js\` 的 \`posts\` 数组中。新增文章后重新运行脚本，会同步生成页面、搜索索引、RSS 和 sitemap。

## 部署

该仓库是 GitHub Pages 用户站点仓库，推送到 GitHub 后通过以下地址访问：

\`\`\`text
${site.url}/
\`\`\`

如果 GitHub Pages 尚未开启，在仓库 Settings -> Pages 中选择从当前分支根目录发布。
`;
}

write('index.html', homePage());
write('categories/index.html', categoriesPage());
write('tags/index.html', tagsPage());
write('archives/index.html', archivesPage());
write('about/index.html', aboutPage());
write('friends/index.html', friendsPage());
write('contact/index.html', contactPage());
write('404.html', notFoundPage());
posts.forEach(post => write(`posts/${post.slug}/index.html`, articlePage(post)));
write('search.xml', searchXml());
write('atom.xml', atomXml());
write('sitemap.xml', sitemapXml());
write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`);
write('.nojekyll', '');
write('README.md', readme());

console.log(`Generated ${posts.length} posts and ${8 + posts.length} pages.`);
