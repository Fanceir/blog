---
id: Commonjs-EsModule
slug: Commonjs-EsModule
title: Commonjs和EsModule
date: 2024-11-06
authors: Fanceir
tags: [interview, front-end]
keywords: [interview, front-end]
---

## Commonjs 和 EsModule

### 产生的原因

早期 js 开发很容易存在全局污染和依赖管理混乱的问题，因为开始实在 script 标签导入 js 文件，如果一个文件中定义 name 为一个字符串的变量，另一个文件定义为函数，那么就会出现问题，因为每个加载的 js 文件都共享变量

### commonjs

`commonjs`的提出弥补了 JS 对于模块化没有统一标准的缺陷，nodejs 借鉴了 CommonJS 的规范，实现了良好的模块化管理

Node 是 commonjs 在服务端的一个实现
Browserify 是 commonjs 在浏览器端的一个实现

得益于 `webpack` 的出现，可以尽情地使用 `commonjs` 的模块化规范

#### 使用 commonjs

- 在 `commonjs` 下每一个 js 文件都是一个单独的模块
- 在模块中，包含`commonjs`的核心变量是`exports` `module.exports` `require`
- `require` 函数可以帮助导入其他模块

module 记录当前的模块信息，require 引入导入模块的方法，exports 导出模块的方法

```js
const sayName = require("./hello.js");
module.exports = function say() {
  return {
    name: sayName(),
    author: "我是谁",
  };
};
```

在 commonjs 的规范下，会形成一个包装函数，使用的 require，exports，module 本质上都是形参传递到包装函数中的
包装函数

```js
function wrapper(script) {
  return (
    "(function (exports, require, module, __filename, __dirname) {" +
    script +
    "\n})"
  );
}
```

#### require 文件的加载

```js
const fs = require("fs");
const sayName = require("./hello.js");
const crypto = require("crypto");
```

这里三个代码片段一个是 nodejs 底层的核心模块，一个是我们编写的文件模块，一个是下载的第三方的自定义模块

require 执行的时候，接收的唯一参数作为一个标识符，Commonjs 下对不同的标识符，处理流程不同，但是都是为了找到对应的模块
首先在当前目录下的`node_modules`文件夹下查找，如果没有找到，会一直向上查找，直到根目录

require 的引入是使用了深度优先遍历的方法

#### require 加载原理

module 和 Module 的区别

- module Node 中的每一个 js 都是一个 module,module 上除了保存 exports 等信息外，还有一个 loaded 表示是否加载完成
- Module 会缓存每一个模块加载的信息

require 是如何避免重复加载的，首先加载之后的文件的 module 会被缓存到 Module.\_cache 中，如果再次加载的时候，会直接从缓存中读取
