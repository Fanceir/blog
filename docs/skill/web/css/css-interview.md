---
id: css-interview
slug: css-interview
title: css准备面试
date: 2025-02-03
authors: Fanceir
tags: [interview, front-end, css]
keywords: [interview, front-end, css]
---

## css 准备面试

这里记录的是平时获取到的一些题目

### css 的单位

在 css 中最常见的单位主要有这几个 px em rem
这三个的区别是

- px 是固定的单位，一旦设置了就不会改变
- em 是相对长度单位，基于当前元素的字体大小，但是会受到父元素的影响
- rem 是相对于根元素`<html>`的字体大小

```css
html {
  font-size: 16px;
}
h1 {
  font-size: 2rem; /* 32px */
}
h2 {
  font-size: 1.5rem; /* 24px */
}
```

```css
.parent {
  font-size: 16px;
}
.child {
  font-size: 1.5em; /* 24px */
}
```
