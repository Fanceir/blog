---
id: what-is-vite
slug: what-is-vite
title: vite基础学习
date: 2024-11-24
authors: Fanceir
tags: [interview, front-end]
keywords: [interview, front-end]
---

这是字节青训营上课部分的笔记

## 为什么需要构建工具

前端项目就是由资源和代码组成的，所以需要模块化、组件化、自动化、规范化等等，这些都是构建工具的作用。有资源编译的问题，因为浏览器是不认识这些资源的比如`jsx`、`less`、`scss`等等，所以需要构建工具来编译这些资源。产物的质量问题，因为线上的代码需要压缩的，对于未使用的代码需要剔除掉。还需要兼容到低端的浏览器，否则可能出现白屏的情况。

## 前端构建工具

- 前端构建工具可以解决模块化的方案，提供模块的加载方案，兼容不同模块的规范
- 语法转换，比如`jsx`、`es6`、`ts`等等
- 产物质量，产物压缩无用的代码删除
- 开发效率，可以使用热更新技术，提高开发效率

## 什么是 vite

- no bundle 开发服务，源文件是不需要打包的
- 生产环境基于 rollup 的 bundler

vite 的性能很高，dev 启动的速度和热更新的速度很快
浏览器的原生 esm 支持

```html
<script type="module" src="./main.js"></script>
```

无需打包项目的源代码，可以天然按需加载，可以使用文件系统的缓存

esbuild 包括打包器 编译器 代码压缩器

## 动手用 vite

```bash
pnpm init vite@latest

```

接入 sass

```bash
pnpm i sass
```

生产环境的 tree shaking

- 优化原理基于 ESM 的 import 和 export 的依赖关系，与运行时候的状态无关
- 在构架中将没有使用的代码删除掉

esbuild 可以提升编译速度但是不支持代码降级到 ES5 不支持类型检查，所以需要调用 tsc

## Vite 插件

todo
