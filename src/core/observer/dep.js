/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * 在读取响应式数据时，负责收集依赖
 * 在响应式数据更新时，负责通知 dep 中那些 watcher 去执行 update
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  // 在dep中添加watcher
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  // 移除watcher
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  // 向 watcher 中添加 dep
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  // 通知 dep 中的所有 watcher，执行 watcher.update()
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
/**
 * 当前正在执行的 watcher，同一时间只会有一个 watcher 在执行
 * Dpe.target = 当前正在执行的 watcher
 * 通过调用 pushTarget 方法完成赋值，调用 popTarget 方法完成重置 null
 */
Dep.target = null
const targetStack = []

// 在需要进行依赖收集的时候调用
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

// 依赖收集结束调用
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
