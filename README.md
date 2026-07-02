# Dai-GoGo 技术笔记

这是 `Dai-GoGo.github.io` 的 GitHub Pages 静态博客仓库。当前 UI 已重构为 Cantor8-inspired 的蓝白机构感视觉系统，并加入博客化的信息架构：主题轨道、文章详情、归档、标签、搜索、RSS 和 sitemap。

## 本地预览

```powershell
node scripts\static-server.js
```

访问：

```text
http://127.0.0.1:4000/
```

## 生成整站

```powershell
node scripts\build-cantor-blog.js
```

文章数据目前集中在 `scripts/build-cantor-blog.js` 的 `posts` 数组中。新增文章后重新运行脚本，会同步生成页面、搜索索引、RSS 和 sitemap。

## 部署

该仓库是 GitHub Pages 用户站点仓库，推送到 GitHub 后通过以下地址访问：

```text
https://dai-gogo.github.io/
```

如果 GitHub Pages 尚未开启，在仓库 Settings -> Pages 中选择从当前分支根目录发布。
