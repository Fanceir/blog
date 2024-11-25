---
id: browser-debug
slug: browser-debug
title: 浏览器debug
date: 2024-11-24
authors: Fanceir
tags: [browser, front-end]
keywords: [browser, front-end]
---

## css 的 debug

可以选中元素，右键，选择检查，然后在右侧的样式中，可以直接修改样式，查看效果。
可以直接点击，选择`Force element state`，查看元素的不同状态下的样式。

## js 的 debug

注意 debug error warn log 等方法的使用，可以在控制台中查看。暂停状态下，鼠标的 hover 可以查看变量的值。可以使用 console.table()方法，将数组或对象以表格的形式输出。

```js
console.log("log");
console.error("error");
console.warn("warn");
console.table([
  { a: 1, b: 2 },
  { a: 3, b: 4 },
]);
console.dir(document.body);
```

可以使用 debugger 关键字设置断点，然后在控制台中查看变量的值。
在设置断电之前可以使用 console.log()方法输出变量的值。

```js
function handleClick() {
  console.log("click");
  debugger;
}
```

注意字符串 数字 在控制台中的显示方式，可以使用 console.log()方法输出变量的值。

## 混淆之后的代码

混淆之后的代码，可以使用 source map 进行还原，可以在控制台中查看。结合 source map 找回原来的代码，但是如果一起上传 sourcemap 就又暴露了源代码，所以一般不会上传 sourcemap，会删除 source map，单独上传到服务器上。

## network 的 debug

network 中可以查看请求的状态，请求的数据，请求的时间等信息。可以查看请求的 header，response，preview，timing 等信息，上面的选项可以选择 3G 4G 等不同的网络速度，可以模拟不同的网络环境。

## Application

有 local storage，session storage，cookie，indexDB，cache storage 等信息，可以查看。

## Performance

这个是和网页的性能相关的
