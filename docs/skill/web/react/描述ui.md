---
id: describing-the-ui
slug: /describing-the-ui
title: 描述UI
date: 2024-10-13
authors: Fanceir
tags: [react]
keywords: [react]
---

## 1 第一个组件

### 1.1 什么是组件

组件是 React 的核心概念之一，是构建用户界面的基础
这里先写一个组件

```jsx
import React from "react";
export default function App() {
  return <h1>Hello, React!</h1>;
}
```

当然组件也可以返回一个 img 标签

```jsx
import React from "react";
export default function App() {
  return (
    <img
      src="https://www.baidu.com/img/flexible/logo/pc/result.png"
      alt="baidu"
    />
  );
}
```

### 1.2 使用组件

在导出组件之后可以在其他文件中使用这个组件

```jsx
// sidebar.js
import React from "react";
export default function Sidebar() {
  return (
    <div>
      <h1>我是Sidebar</h1>
    </div>
  );
}

//app.js
import React from "react";
import Sidebar from "./sidebar";
export default function App() {
  return (
    <div>
      <h1>Hello, React!</h1>
      <Sidebar />
    </div>
  );
}
```

当然也可以在一个组件内部使用多个组件

### 1.3 组件的使用

组件是常规的 JavaScript 函数，但是请不要在一个组件的内部定义另外的一个组，应该在顶层定义每一个组件

## 2 组件的导入和导出

组件可以重复利用，所以创建一个组件之后可以添加其他组件
在上面创建了一个 Profile 组件，并且进行了渲染

```jsx
function Profile() {
  return <img src="https://www.fanxu.online/img/logo.webp" alt="Fanceir" />;
}
export default function Gallery() {
  return (
    <div>
      <h1>Gallery</h1>
      <Profile />
    </div>
  );
}
```

### 同一个文件中导出和导入多个组件

这里介绍一下默认导出和命名导出的区别
如果一个文件中只有一个组件需要导出，那么可以使用默认导出

```jsx
export default function App() {
  return <h1>Hello, React!</h1>;
}
```

如果一个文件中有多个组件需要导出，那么可以使用命名导出

```jsx
export function App() {
  return <h1>Hello, React!</h1>;
}
export function Sidebar() {
  return <h1>我是Sidebar</h1>;
}
```

同一文件中，有且仅有一个默认导出，但可以有多个具名导出

注意合理的拆分组件会使代码更加清晰更加易于维护
