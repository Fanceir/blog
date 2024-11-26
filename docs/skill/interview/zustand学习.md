---
id: zustand-learning
slug: zustand-learning
title: 学习zustand
date: 2024-11-26
authors: Fanceir
tags: [zustand, front-end]
keywords: [zustand, front-end]
---

上周学习了 zustand 的使用，写一篇博客记录一下，zustand 的存储库
[zustand 的存储库](https://github.com/Fanceir/zustandlearning)

zustand 是一个状态管理的库，它是一个基于 react hooks 的状态管理库，它的特点是简单、轻量、易用，它的 api 设计的很简单，只有三个函数，create、useStore、devtools

## 安装 zustand

```bash
npm i zustand
```

因为 zustand 是基于 react 的 hooks 的 api，使用还是比较简单易懂的。

我们的存储是一个钩子，可以在里面放任何的东西，原始值，对象，函数，通过`create((set)=>({state:0}))`的方式来创建一个 store，然后就可以在任何的地方使用这一个钩子，当状态发生改变的时候，就会自动地更新组件。

## 状态管理的本质

单例模式，我们在在一个地方创建了一个记录，我们在后续的操作中，都是在这个记录上进行操作，这样就可以保证数据的一致性。
观察者模式，当数据发生改变的时候，会通知所有的观察者，这样就可以保证数据的一致性。

那么 zustand 的伪代码就可以写成这样

```ts
function CreateStore(initState) {
  let state = initState;
  const listeners = []; // 存储订阅的监听器

  // 更新状态并通知所有订阅者
  function setState(newState) {
    state = { ...state, ...newState }; // 合并新状态
    listeners.forEach((listener) => listener(state)); // 通知所有订阅者
  }

  // 获取当前的状态
  const getState = () => state;

  // 订阅状态变化
  const subscribe = (listener) => {
    listeners.push(listener); // 将监听器添加到订阅列表
    // 返回一个取消订阅的函数
    return () => {
      // 更新 listeners 数组，移除对应的 listener
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  // 返回 store 对外的接口
  return { setState, getState, subscribe };
}
```

```tsx
const store = CreateStore({ count: 0 });

// 订阅状态变化
const unsubscribe = store.subscribe((state) => {
  console.log("State updated:", state);
});

// 更新状态
store.setState({ count: 1 }); // 会触发订阅者的回调，打印 "State updated: { count: 1 }"

// 获取当前状态
console.log(store.getState()); // 输出: { count: 1 }

// 取消订阅
unsubscribe();

// 再次更新状态，不会触发取消的订阅者
store.setState({ count: 2 }); // 不会打印任何信息
```

创建一个 store，初始状态为 { count: 0 }，然后通过订阅状态的变化，当状态发生变化时，会通知所有的订阅者，这样就实现了状态管理的功能。

`zustand`避免了使用 ReactContext 或者传递 props 的操作，在 React 中状态时需要多层组件传递然后通过上下文来实行共享的，而在 zustand 中，任何组件都可以使用 store 中的状态或者更新方法。

zustand 的比较方式，zustand 使用了浅比较来优化性能，当 store 中的某个状态发生变化的时候，订阅了改状态的组件才会被重新渲染。

## zustand 的使用

```tsx
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface BearState {
  bears: number;
  increase: () => void;
}
const useBearState = create<BearState>()(
  devtools(
    persist((set, get) => {
      return {
        bears: 0,
        increase: () => set((state) => ({ bears: state.bears + 1 })),
      };
    }),
    {
      name: "bear-storage",
    }
  )
);
```

注意这里的`create<BearState>()`括号是很重要的，`create<BearState>()`表示我们在创建 store 的时候指定了 store 的状态，更重要的为了让中间件可以更好的运行

## 快速上手

```tsx
type BearType = {
  bears: number;
  incrementBears: () => void;
  resetBears: () => void;
  decrementBears: (step?: number) => void;
  //异步修改
  asyncIncrementBears: () => void;
};
```

```tsx
//store/index.ts
import { create } from "zustand";
//首先导入了zustand的create
const useStore = create<BearType>()((set, get) => {
  return {
    //bears相关的数据
    bears: 0,
    incrementBears: () => {
      set((prevState) => ({ bears: prevState.bears + 1 }));
    },
    resetBears: () => {
      set({ bears: 0 });
    },
    decrementBears: (step = 1) => {
      set((prevState) => ({ bears: prevState.bears - step }));
    },
    asyncIncrementBears: () => {
      setTimeout(() => {
        get().incrementBears();
      }, 1000);
    },
  };
});

export default useStore;
```

```tsx
import { FC } from "react";
import useStore from "./store";
export const Bear: FC = () => {
  const bears = useStore((state) => state.bears);
  return (
    <div>
      <h1>小熊的数量是{bears}</h1>
    </div>
  );
};
export const Child: FC = () => {
  const incrementBears = useStore((state) => state.incrementBears);
  const resetBears = useStore((state) => state.resetBears);
  const decrementBears = useStore((state) => state.decrementBears);
  const asyncIncrementBears = useStore((state) => state.asyncIncrementBears);
  return (
    <div>
      <button onClick={incrementBears}>增加</button>
      <button onClick={resetBears}>重置</button>
      <button onClick={decrementBears}>减少</button>
      <button onClick={asyncIncrementBears}>异步增加</button>
    </div>
  );
};
```

使用自动生成选择器

```tsx
import { StoreApi, UseBoundStore } from "zustand";

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};
```

然后在 store/index.ts 中使用

```tsx
import { createSelectors } from "./createSelectors";

import { create } from "zustand";
//首先导入了zustand的create
const useStore = create<BearType>()((set, get) => {
  return {
    //bears相关的数据
    bears: 0,
    incrementBears: () => {
      set((prevState) => ({ bears: prevState.bears + 1 }));
    },
    resetBears: () => {
      set({ bears: 0 });
    },
    decrementBears: (step = 1) => {
      set((prevState) => ({ bears: prevState.bears - step }));
    },
    asyncIncrementBears: () => {
      setTimeout(() => {
        get().incrementBears();
      }, 1000);
    },
  };
});

export default useStore;
export const useStoreWithSelectors = createSelectors(useStore);
```

然后就可以愉快的使用

```tsx
import { useStoreWithSelectors } from "./store";
//
const bears11 = useStoreWithSelectors.use.bears(); //可以使用这样的方式来导入获取数据
```

## 优化

可以将操作和状态拆分开来，这样可以更好的管理状态，这有利于代码的分割

```tsx
//1 按需导入create函数
import { create } from "zustand";
//在zustand中中间件本身就是一个函数
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
//2 创建store的hook
//使用devtools一定要晚于immer
import createSelector from "@/tools/createSelector";

const useBearStore = create<BearStoreType>()(
  immer(
    devtools(
      persist(
        () => {
          return {
            //bears相关的数据
            bears: 0,
          };
        },
        { name: "bear-store" }
      ),
      { name: "bear-store" }
    )
  )
);
export const incrementBears = () => {
  //使用immer的语法
  useBearStore.setState((prevState) => {
    prevState.bears += 1;
  }); //函数体的大括号不可以省略
};
export const resetBears = () => {
  useBearStore.setState({ bears: 0 });
}; //这是对象合并的方式
export const decrementBears = (step = 1) => {
  useBearStore.setState((prevState) => {
    prevState.bears -= step;
  });
};
export const asyncIncrementBear = () => {
  setTimeout(() => {
    incrementBears();
  }, 1000);
};

export default useBearStore;
export const useBearSelector = createSelector(useBearStore);
```

这里使用了 Zustand 的多个中间件（devtools、persist、immer）来创建一个 store，
，通过封装的操作函数（incrementBears、decrementBears、resetBears 等）来操作 store 的状态。

重置状态的方法，可以实现使用一个 init 状态

```tsx
//然后再使用useBearStore的时候，可以使用这个initState
import { StateCreator } from "zustand";
import useStore from "@/store";
import resetters from "../tools/resetters";
const initBearState = {
  bears: 0,
};
//这里就是我的init状态
const createBearSlice: StateCreator<BearSliceType> = (set) => {
  resetters.push(() => {
    set(initBearState);
  });
  return {
    ...initBearState,
  };
};
export const incrementBears = () =>
  useStore.setState((prevState) => {
    prevState.bears++;
  });

export const resetBears = () => {
  useStore.setState(initBearState);
};
export const decrementBears = (step = 1) => {
  useStore.setState((prevState) => ({ bears: prevState.bears - step }));
};
export const asyncIncrementBears = () => {
  setTimeout(() => {
    incrementBears();
  }, 1000);
};
export default createBearSlice;
```

使用这种方式，可以使结构更加清晰，在创建的时候就已经使用了 init 状态
