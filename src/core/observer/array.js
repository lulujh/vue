/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'
// 备份数组原型对象
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

// 这七个方法可以改变数组自身
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events 拦截变异方法并触发事件
 */
methodsToPatch.forEach(function (method) {
  // cache original method 缓存原生方法
  const original = arrayProto[method]
  // /src/core/util/lang.js
  def(arrayMethods, method, function mutator (...args) {
    // 先执行原生方法
    const result = original.apply(this, args)
    const ob = this.__ob__
    // 如果 method 是以下三个之一，说明是新插入了元素
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 对新插入的元素做响应式处理
    if (inserted) ob.observeArray(inserted)
    // notify change 通知更新
    ob.dep.notify()
    return result
  })
})
