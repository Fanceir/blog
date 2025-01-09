---
id: vdom-fiber-diff
slug: 虚拟DOM和Fiber
title: React的重要原理
date: 2025-01--7
authors: Fanceir
tags: [react]
keywords: [react]
---

## 虚拟 DOM

首先先看一下虚拟 dom
虚拟 dom 就是使用 Javascript 对象去描述一个 DOM 结构，虚拟 DOM 不是直接操作浏览器的真实 DOM，而是首先对 UI 的更新在虚拟 DOM 上进行，然后再高效地同步到真实的 DOM 上

优点
性能的优化，涉及大量节点的更新的时候虚拟 DOM 可以去减少不必要的 DOM 操作，主要体现在 Diff 算法的复用操作，但实际上也提高不了多少性能
跨平台性 虚拟 DOM 是一个与平台没有关系的概念可以映射到不同的渲染目标

### 实现简易的虚拟 DOM

平时我们在写 react 组件的时候会这样写

```jsx
const App = () => {
  return <div>hello world</div>;
};
```

上面的这段代码可以被 babel 转化为

```js
const App = () => {
  return React.createElement("div", null, "hello world");
};
```

JSX 通过 babel 或者其他工具转化为 js 然后使用 createElement 方法来传递标签名称 props 和 child 元素

接下来来实现 React.createElement 方法

### 实现 createElement 方法

React.createElement 是用于实现虚拟的 DOM 树，通过返回一个包含 type 和 props 的对象，type 是元素类型，props 是属性和子元素
children 可以是其他的虚拟 DOM 对象
createTextElement 是用来处理文本节点的，因为我们平时会写这样的 JSX 代码

```jsx
const App = () => {
  return <div>hello world</div>;
};
```

这里面的 hello world 就是文本节点，所以我们需要处理文本节点

```js
const React = {
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map((child) => {
          if (typeof child === "object") {
            return child;
          } else {
            return React.createElement(child);
          }
        }),
      },
    };
  },
  createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  },
};
// const text = document.createTextNode('');
// text.nodeValue = 'hello world';
```

但是上面的有一个问题，如果渲染的过多，就需要等待，但是 React 有一个类似于浏览器钟的机制，就是 requestIdleCallback，
这个方法会在浏览器空闲的时候执行，所以我们可以使用这个方法来实现渲染

```js
let nextUnitOfWork = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  //下一个空闲时间执行
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
function performUnitOfWork(nextUnitOfWork) {}
```

## React fiber

react Fiber 是 react16 中引入的一种新的协调引擎，用于解决和优化 react 应对复杂 Ui 的性能问题

fiber 有两个树，一个是当前的工作树，一个是之前的树，这样可以在两个树之间进行比较，然后找出需要更新的节点，然后进行更新

### 浏览器的任务切片

首先浏览器的一帧执行的任务有

- 处理事件的回调 chick 事件
- 处理计时器的回调
- 开始执行 requestAnimationFrame 的回调
- 计算机页面布局的计算合并到主线程
- 绘制
- 执行 requestIdleCallback 的回调

注意的是现在 react 是不适用 requestIdleCallback 的

- 浏览器的兼容性问题，safari 是不支持的，因为 requestIdleCallback 是一个实验性的 API，所以不是所有的浏览器都支持，所以 react 使用的是 requestAnimationFrame
- react 需要更加精确地控制任务地优先级，尤其是在并发的模式下

  scheduler 包是 react 的调度器，可以更加精确地控制任务的优先级，但是两者上的理念还是很相似的

```js
let nextUnitOfWork = null; //下一个工作单元
let wipRoot = null; //当前正在工作的fiber树
let currentRoot = null; //旧的fiber树
let deletions = null; //存储需要删除的fiber节点

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot; //赋值为第一个工作单元然后接下来就可以直接执行了
}

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props); //挂载一个空的属性
  return dom;
}

function updateDom(dom, prevProps, nextProps) {
  //删除旧的或者改变的属性
  Object.keys(prevProps)
    .filter((name) => name !== "children")
    .forEach((name) => {
      dom[name] = "";
    });
  //设置新的或者改变的属性
  Object.keys(nextProps)
    .filter((name) => name !== "children")
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  //下一个空闲时间执行
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber);
  //下面是查找的过程
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

function reconcileChildren(fiber, elements) {
  //diff算法
  //形成fiber树
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {}
}
```

## diff 算法

如果有 ABCD 四个节点 react 会把这四个节点表示成链表结构，然后进行比较，如果有节点被删除了，那么就会把这个节点的 effectTag 设置为 DELETION，然后在 commitRoot 方法中进行删除

## 完整的代码

```js
const React = {
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map((child) => {
          if (typeof child === "object") {
            return child;
          } else {
            return React.createElement(child);
          }
        }),
      },
    };
  },
  createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  },
};
// const text = document.createTextNode('');
// text.nodeValue = 'hello world';
const vdom = React.createElement("div", { id: "foo" }, "hello world");
console.log(vdom);
let nextUnitOfWork = null; //下一个工作单元
let wipRoot = null; //当前正在工作的fiber树
let currentRoot = null; //旧的fiber树
let deletions = null; //存储需要删除的fiber节点

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot; //赋值为第一个工作单元然后接下来就可以直接执行了
}

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props); //挂载一个空的属性
  return dom;
}

function updateDom(dom, prevProps, nextProps) {
  //删除旧的或者改变的属性
  Object.keys(prevProps)
    .filter((name) => name !== "children")
    .forEach((name) => {
      dom[name] = "";
    });
  //设置新的或者改变的属性
  Object.keys(nextProps)
    .filter((name) => name !== "children")
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  //下一个空闲时间执行
  //nextUnitOfWork = null;所有的任务都已经执行完成了 并且还有待提交的工作
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber);
  //下面是查找的过程
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

function createFiber(element, parent) {
  return {
    type: element.type,
    props: element.props,
    parent,
    dom: null,
    child: null,
    sibling: null,
    alternate: null,
    effectTag: null,
  };
}

function reconcileChildren(fiber, elements) {
  //diff算法
  //形成fiber树
  let index = 0;
  let prevSibling = null;
  let oldFiber = fiber.alternate && fiber.alternate.child; //旧的fiber树
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    //1 复用
    let newFiber = null;
    const sameType = oldFiber && element && element.type === oldFiber.type;
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        parent: fiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    //2 新增
    if (element && !sameType) {
      newFiber = createFiber(element, fiber);
      newFiber.effectTag = "PLACEMENT"; //新增
    }
    //3 删除
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"; //删除
      deletions.push(oldFiber);
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork() {
  if (fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  }
  if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }
  if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

## requestIdleCallback 的基本用法

requestIdleCallback 接受一个回调函数 callback 并且会在回调函数中注入 deadline
一般不适用 setTimeout 因为 setTimeout 会有延迟现象

React 简易版的调度器
React 给每个任务都分配了优先级

```js
const ImmediatePriority = 1; // 立即执行的优先级, 级别最高 [点击事件，输入框，]
const UserBlockingPriority = 2; // 用户阻塞级别的优先级, [滚动，拖拽这些]
const NormalPriority = 3; // 正常的优先级 [redner 列表 动画 网络请求]
const LowPriority = 4; // 低优先级  [分析统计]
const IdlePriority = 5; // 最低阶的优先级, 可以被闲置的那种 [console.log]

// 获取当前时间
function getCurrentTime() {
  return performance.now();
}

class SimpleScheduler {
  constructor() {
    this.taskQueue = []; // 任务队列
    this.isPerformingWork = false; // 当前是否在执行任务

    // 使用 MessageChannel 处理任务调度
    const channel = new MessageChannel();
    this.port = channel.port2;
    channel.port1.onmessage = this.performWorkUntilDeadline.bind(this);
  }

  // 调度任务
  scheduleCallback(priorityLevel, callback) {
    const curTime = getCurrentTime();
    let timeout;
    // 根据优先级设置超时时间
    switch (priorityLevel) {
      case ImmediatePriority:
        timeout = -1;
        break;
      case UserBlockingPriority:
        timeout = 250;
        break;
      case LowPriority:
        timeout = 10000;
        break;
      case IdlePriority:
        timeout = 1073741823;
        break;
      case NormalPriority:
      default:
        timeout = 5000;
        break;
    }

    const task = {
      callback,
      priorityLevel,
      expirationTime: curTime + timeout, // 直接根据当前时间加上超时时间
    };

    this.push(this.taskQueue, task); // 将任务加入队列
    this.schedulePerformWorkUntilDeadline();
  }

  // 通过 MessageChannel 调度执行任务
  schedulePerformWorkUntilDeadline() {
    if (!this.isPerformingWork) {
      this.isPerformingWork = true;
      this.port.postMessage(null); // 触发 MessageChannel 调度
    }
  }

  // 执行任务
  performWorkUntilDeadline() {
    this.isPerformingWork = true;
    this.workLoop();
    this.isPerformingWork = false;
  }

  // 任务循环
  workLoop() {
    let curTask = this.peek(this.taskQueue);
    while (curTask) {
      const callback = curTask.callback;
      if (typeof callback === "function") {
        callback(); // 执行任务
      }
      this.pop(this.taskQueue); // 移除已完成任务
      curTask = this.peek(this.taskQueue); // 获取下一个任务
    }
  }

  // 获取队列中的任务
  peek(queue) {
    return queue[0] || null;
  }

  // 向队列中添加任务
  push(queue, task) {
    queue.push(task);
    queue.sort((a, b) => a.expirationTime - b.expirationTime); // 根据优先级排序，优先级高的在前 从小到大
  }

  // 从队列中移除任务
  pop(queue) {
    return queue.shift();
  }
}

// 测试
const scheduler = new SimpleScheduler();

scheduler.scheduleCallback(LowPriority, () => {
  console.log("Task 1: Low Priority");
});

scheduler.scheduleCallback(ImmediatePriority, () => {
  console.log("Task 2: Immediate Priority");
});

scheduler.scheduleCallback(IdlePriority, () => {
  console.log("Task 3: Idle Priority");
});

scheduler.scheduleCallback(UserBlockingPriority, () => {
  console.log("Task 4: User Blocking Priority");
});

scheduler.scheduleCallback(NormalPriority, () => {
  console.log("Task 5: Normal Priority");
});
```
