---
id: how-to-use-this
slug: how-to-use-this
title: 如何使用this
date: 2024-11-02
authors: Fanceir
tags: [interview, front-end]
keywords: [interview, front-end]
---

这是 2024 年 11 月 2 日更新的文章，尽力做到 11 月每天都更新一篇较高质量的文章

回想一下什么时候会用到 this，现在 react 中普遍使用了函数式组件，弱化了 this 的使用，但是面试还是很喜欢考察 this 的使用的，我做个整理准备 this 相关的使用，this 有哪些考点呢
在学习闭包的时候，经常使用到 this，这也是红宝书中第 10 章 this 的一个部分，在使用 Symbol 的时候，也会用到 this

## 总结 this 的使用

下面总的介绍一下 this 的使用

- 默认绑定，这是最常见的绑定了，在非严格模式下 this 指向的式全局对象，在浏览器中就是 window 在 node 中是 global
- 隐式绑定，例如函数的引用有上下文的对象，`obj.foo()` 这个时候 this 指向的是 obj
- 显示绑定使用 call apply bind，这个时候 this 指向的是传入的对象
- new 绑定，使用 new 关键字调用函数，这个时候 this 指向的是新创建的对象

### 箭头函数和标准函数中的 this

在标准函数中 this 引用的是把函数当成方法调用的上下文对象，在网页的全局上下文中 this 指向的是 windows

在箭头函数中 this 的引用时定义箭头函数的上下文，箭头函数时没有自己的 this 的
举例子

```js
window.col = "red";
let obj = {
  color: "blue",
};
function sayColor() {
  console.log(this.color);
}
sayColor(); // red
obj.sayColor = sayColor;
obj.sayColor(); // blue
```

```js
window.col = "red";
let obj = {
  color: "blue",
};
let sayColor = () => {
  console.log(this.color);
};
sayColor(); // red
obj.sayColor = sayColor;
obj.sayColor(); // red
```

上面的例子是上下文的例子，下面的是箭头函数的例子，这里先将箭头函数的例子，箭头函数的 this 是定义箭头函数的上下文，所以这里的 this 指向的是 window

## 默认绑定

1.1 直接调用函数

```js
var color = "red";
function sayColor() {
  console.log(this.color);
}
sayColor(); // red
```

在之前讲过的 let 和 const 中说过，var 是全局变量定义的变量会挂到 window 上所以这里的 this 指向的是 window 输出就是 red

1.2 严格模式下的默认绑定

```js
"use strict";
var a = 10;
function foo() {
  console.log("this:", this);
  console.log("this.a:", this.a);
}
console.log(window.foo);
//ƒ foo () {...}
foo(); // this: undefined
// this.a: Uncaught TypeError: Cannot read property 'a' of undefined
```

1.3 let 和 const 的默认绑定

```js
let a = 10;
const b = 20;
function foo() {
  console.log("this:", this.a);
  console.log("this.b:", this.b);
}
foo(); // this.a: undefined this.b: undefined
console.log(window.foo); // undefined
```

这里都是 undefined，因为使用了 let,let 是不会挂载到 window 上的

1.4 函数套函数

```js
var color = "red";
function foo() {
  var color = "blue";
  function bar() {
    console.log(this.color);
  }
  bar();
}
foo(); // red
```

为什么会是这样的呢？首先我们使用了`foo()`，这样我们进入到了`foo`函数中，然后我们在`foo`函数中调用了`bar`函数，这个时候`bar`函数是一个普通函数，所以`this`指向的是全局对象，所以输出的是`red`

## 隐式绑定

施工中🚧🚧🚧
