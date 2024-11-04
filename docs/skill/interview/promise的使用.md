---
id: how-to-use-promise
slug: how-to-use-promise
title: 如何使用promise
date: 2024-11-02
authors: Fanceir
tags: [interview, front-end]
keywords: [interview, front-end]
---

## promise 的基础概念

Promise 对象标识一个异步操作，有三种状态，pending fulfilled rejected，当 promise 被调用之后它会显示 pending 状态，被创建的 promise 最后会以 fulfilled 或者 rejected 状态结束

来看这样一段代码

```js
let myPromise2 = new Promise((resolve, reject) => {
  let a = 1;
  for (let index = 0; index < 5; index++) {
    a++;
  }
});
console.log("myPromise2 :>> ", myPromise2);

myPromise2.then(() => {
  console.log("myPromise2执行了then");
});
```

在 pending 状态下，promise 不会执行回调函数 then

## 手写 promise

通过手写 `promise` 来了解 `promise` 的实现原理
回忆一下一刚刚整理的 `promise` ，`promise` 是有两个参数的，一个是 `resolve` 表示成功，一个是 `reject` 表示拒绝，由此还可以引申推广到，`promise` 的三个状态，分别是 `pending`, `fulfilled`, `rejected`

promise 肯定是一个类，这个类有 resolve 和 reject 两个方法，还有一个 then 方法，then 方法接收两个参数，一个是成功的回调，一个是失败的回调，then 方法还会返回一个新的 promise

```js
class myPromise {
  constructor(executor) {
    let resolve = () => {}; //成功
    let reject = () => {}; //失败
    executor(resolve, reject);
  }
}
```

然后根据三个状态

```javascript
class myPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    let resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
      }
    };
    let reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
      }
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
}
```

平时我们使用完了这些东西之后会使用`.then`方法来做下一步操作

```javascript
class myPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    let resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onFulfilled, onRejected) {
    if (this.state === "fulfilled") {
      onFulfilled(this.value);
    }
    if (this.state === "rejected") {
      onRejected(this.reason);
    }
    if (this.state === "pending") {
      this.onResolvedCallbacks.push(() => {
        onFulfilled(this.value);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}
```

如果 then 中如果 onFulfilled 和 onRejected 不是函数，那么我们就忽略它，让值穿透

```javascript
class myPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    // executor(this.resolve.bind(this), this.reject.bind(this));
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }
  resolve(value) {
    if (this.state === "pending") {
      this.state = "fulfilled";
      this.value = value;
    }
  }
  reject(reason) {
    if (this.state === "pending") {
      this.state = "rejected";
      this.reason = reason;
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };
    if (this.state === "fulfilled") {
      onFulfilled(this.value);
    }
    if (this.state === "rejected") {
      onRejected(this.reason);
    }
  }
}
```

添加异步操作

```javascript
class myPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = []; // 保存成功回调
    this.onRejectedCallbacks = []; // 保存失败回调

    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(value) {
    if (this.state === "pending") {
      this.state = "fulfilled";
      this.value = value;
      this.onFulfilledCallbacks.forEach((callback) => callback());
    }
  }

  reject(reason) {
    if (this.state === "pending") {
      this.state = "rejected";
      this.reason = reason;
      this.onRejectedCallbacks.forEach((callback) => callback());
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    if (this.state === "pending") {
      this.onFulfilledCallbacks.push(() => {
        setTimeout(() => {
          onFulfilled(this.value);
        });
      });
      this.onRejectedCallbacks.push(() => {
        setTimeout(() => {
          onRejected(this.reason);
        });
      });
    }
    if (this.state === "fulfilled") {
      setTimeout(() => {
        onFulfilled(this.value);
      });
    }
    if (this.state === "rejected") {
      setTimeout(() => {
        onRejected(this.reason);
      });
    }
  }
}
```

链式调用

```javascript
class myPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = []; // 保存成功回调
    this.onRejectedCallbacks = []; // 保存失败回调

    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(value) {
    if (this.state === "pending") {
      this.state = "fulfilled";
      this.value = value;
      this.onFulfilledCallbacks.forEach((callback) => callback());
    }
  }

  reject(reason) {
    if (this.state === "pending") {
      this.state = "rejected";
      this.reason = reason;
      this.onRejectedCallbacks.forEach((callback) => callback());
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };
    const promise2 = new myPromise((resolve, reject) => {
      if (this.state === "pending") {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            onFulfilled(this.value);
          });
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            onRejected(this.reason);
          });
        });
      }
      if (this.state === "fulfilled") {
        setTimeout(() => {
          onFulfilled(this.value);
        });
      }
      if (this.state === "rejected") {
        setTimeout(() => {
          onRejected(this.reason);
        });
      }
    });
    return promise2;
  }
}
```

最终版本

```js
class myPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = []; // 保存成功回调
    this.onRejectedCallbacks = []; // 保存失败回调

    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(value) {
    if (this.state === "pending") {
      this.state = "fulfilled";
      this.value = value;
      this.onFulfilledCallbacks.forEach((callback) => callback());
    }
  }

  reject(reason) {
    if (this.state === "pending") {
      this.state = "rejected";
      this.reason = reason;
      this.onRejectedCallbacks.forEach((callback) => callback());
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const promise2 = new myPromise((resolve, reject) => {
      if (this.state === "fulfilled") {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.state === "rejected") {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.state === "pending") {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });

    return promise2;
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }

  if (x && (typeof x === "object" || typeof x === "function")) {
    let used;
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (used) return;
            used = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (used) return;
            used = true;
            reject(r);
          }
        );
      } else {
        if (used) return;
        used = true;
        resolve(x);
      }
    } catch (e) {
      if (used) return;
      used = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}
```

## 做题

### 基础部分

以下都是林呆呆大佬的题目

(https://juejin.cn/post/6844904077537574919)

#### 1.1

```js
const promise1 = new Promise((resolve, reject) => {
  console.log("promise1");
});
console.log("1", promise1);

//promise1
//1 Promise { <pending> }
```

#### 1.2

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  resolve("success");
  console.log(2);
});
promise.then(() => {
  console.log(3);
});
console.log(4);
//1 2 4 3
```

先使用了`new`来新建一个`promise`对象，然后进入执行同步代码打印 1，然后`resolve`成功，promise 的状态改为`resolved`，然后继续执行输出 2 然后看到了`then`任务，这个任务是一个微任务将它加入到微任务队列，然后输出 4 最后输出了 3

#### 1.3

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  console.log(2);
});
promise.then(() => {
  console.log(3);
});
console.log(4);
//1 2 4
```

这里首先进入了 new 然后输出了 1，2，但是没有确定是否是 resolved 还是 rejected，所以没有 then，然后输出了 4

#### 1.4

```js
const promise1 = new Promise((resolve, reject) => {
  console.log("promise1");
  resolve("resolve1");
});
const promise2 = promise1.then((res) => {
  console.log(res);
});
console.log("1", promise1);
console.log("2", promise2);
//'promise1'
//1 Promise { 'resolve1' }
//2 Promise { <pending> }
//resolve1
```

#### 1.5

```js
const fn = () =>
  new Promise((resolve, reject) => {
    console.log(1);
    resolve("success");
  });
fn().then((res) => {
  console.log(res);
});
console.log("start");
// 1
// 'start'
// 'success'
```

注意到这里的 fn 函数后面是一个立即执行函数，所以会直接立即执行，关于立即 Promise 的执行

#### 1.6

```js
const fn = () =>
  new Promise((resolve, reject) => {
    console.log(1);
    resolve("success");
  });
console.log("start");
fn().then((res) => {
  console.log(res);
});
// "start"
// 1
// "success"
```

施工中
🚧🚧🚧
