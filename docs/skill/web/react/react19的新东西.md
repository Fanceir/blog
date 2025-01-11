---
id: react19-new-features
slug: /react19-new-features
title: react19的新功能
date: 2025-01-10
authors: Fanceir
tags: [react]
keywords: [react]
---

今天看了一个 react19 的新特性的视频，决定结合 react19 中的新功能写一篇新的博客

## react19 的新功能

react19 中对 form 的东西有很多优化，这些优化可以帮助我们更好地处理表单的操作

### Aciton

:::tip
首先 react 提出了一个概念（也许是点明出来的一个概念）使用异步过渡的函数被称为 Actions
:::

博客里面是这么说的
actions 自动为管理数据的提交

- pending 状态，actions 提供一个待定状态，这个状态可以在请求开始的时候启动，并且在最终状态更新的时候自动重置
- 乐观更新：在我们很多的操作中，我们可以在用户点击一个操作的时候立即显示出反馈，比如，当用户点击修改 username 的时候可以使用这个`useOptimitic`Hook 来进行立即更新，但是此时你并没有去验证这个操作是否成功，当你后续验证完这个操作之后，你可能会做出一些类似警告的操作。
- 错误处理： action 提供错误处理，因此当请求失败的时候可以使用这个错误处理来恢复到一开始的原始状态
- 表单 from 元素现在支持将函数传递给 action 和 formAction 属性

```jsx
// 使用 Actions 中的待定状态
function UpdateName({}) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const error = await updateName(name);
      if (error) {
        setError(error);
        return;
      }
      redirect("/path");
    });
  };

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        Update
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

上面的代码中使用了一个新的 hook 叫做 useTransition，transition 的意思是过渡，就是说在函数进行处理操作的时候，isPending 会变成 true，当函数处理完之后，isPending 会变成 false 这其实就是一种过渡的状态，在后面的代码中，通过 disabled 来反映这个状态

在 Actions 的基础上又引入了 useOptimistic 来管理乐观的更新，通过新增的 hook React.useActionState 可以处理常见的 Actions

### useActionState

useActionState 是一个可以根据某个表单动作的结果更新 state 的 Hook

```jsx
const [state,formAction,isPending]=useActionState(fn,initialState,permalink?);
```

表单的当前 state 在组件的顶层调用这个 Hook 就可以实现随着表单动作被调用而更新的 state，无论 Action 是否在 Pending 中，他都会返回一个新的 aciton 函数和一个
useActionState 返回一个包含当前值 state 的数组，初始值为提供的初始值 initialstate ，通过表单的提交并且改为传入的 fn 的返回值

```jsx
const [error, submitAction, isPending] = useActionState(async () => {
  const error = await updateName(name);
  if (error) {
    return error;
  }
  redirect("/path");
}，null);
```

### reactDOM 的新 form 功能

Actions 也出现在 react19 的新的 form 功能中，这个是从 reactdom 中拿到的

```jsx
<form action={actionFunction}>
```

### reactDOM 的新 hook useFormStatus

这个可以提供上次表单提交状态信息的 hook

```jsx
const { pendingdata, method, action } = useFormStatus();
```

最主要的还是使用这个来判断是否是 pending 状态

```jsx
import { useFormStatus } from "react-dom";
import action from "./actions";
function Submit() {
  const status = useFormStatus();
  return <button disabled={status.pending}>提交</button>;
}
export default function App() {
  return (
    <form action={action}>
      <Submit />
    </form>
  );
}
```

submit 组件必须在 form 内部渲染，这样才能获取到 form 的状态信息

注意 useFormStatus 只能在 form 内部使用，否则会报错，useFormStatus 只会返回父级组件的状态信息

### useOptimistic

这是为了乐观地在异步请求中展示最终的状态，所以使用了新的 useOptimistic 作为 hook

```jsx
const [optimistic, addOptimistic] = useOptimistic(state, updateFn);
```

首先使用了两个参数，一个是 state，一个是 updateFn，state 是当前的状态，updateFn 是一个函数，这个函数会返回一个新的状态，这个状态会被用来展示在页面上

```jsx
import { useOptimistic } from "react";

function AppContainer() {
  const [optimisticState, addOptimistic] = useOptimistic(
    state,
    // 更新函数

    async (currentState, optimisticValue) => {
      // 使用乐观值
      // 合并并返回新 state
    }
  );
}
```

```js
//actions.js

export async function updateName(name) {
  await new Promise((res) => setTimeout(res, 1000));
  return name;
}
```

```jsx
//App.jsx
import { useOptimistic, useState, useRef } from "react";
import { updateName } from "./actions";
function handleSubmit({ messages, sendMessage }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(
    name,
    async (currentState, optimisticValue) => {
      const error = await updateName(optimisticValue);
      if (error) {
        setError(error);
        return currentState;
      }
      return optimisticValue;
    }
  );
  const handleSubmit = () => {
    startTransition(async () => {
      const error = await updateName(name);
      if (error) {
        setError(error);
        return;
      }
      redirect("/path");
    });
  };
  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        Update
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

### use

use 是一个新的 api，可以让你读区类似于 Promise 或者 context 的资源的值

```jsx
const value = use(resource);
```

与 React Hook 不同的是，可以在循环和条件语句中调用 use

