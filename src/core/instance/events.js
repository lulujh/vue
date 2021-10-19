/* @flow */

import {
  tip,
  toArray,
  hyphenate,
  formatComponentName,
  invokeWithErrorHandling
} from '../util/index'
import { updateListeners } from '../vdom/helpers/index'

export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}

let target: any

function add (event, fn) {
  target.$on(event, fn)
}

function remove (event, fn) {
  target.$off(event, fn)
}

function createOnceHandler (event, fn) {
  const _target = target
  return function onceHandler () {
    const res = fn.apply(null, arguments)
    if (res !== null) {
      _target.$off(event, onceHandler)
    }
  }
}

export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, createOnceHandler, vm)
  target = undefined
}

export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  // 监听实例上的自定义事件
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this
    // 如果event是有多个事件名组成的数组，则遍历这些事件，依次递归调用 $on
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      // 将注册的事件和回调以键值对的形式存储到 vm._events 对象中 vm._events = { eventName: [fn1, ...]}
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      // hook:event 为组件实例注入生命周期方法
      // 该能力是结合 callHook 方法实现的
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }

  // 监听一个自定义事件，但是值触发一次，一旦触发后，监听器就会被移除
  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    // 包装回调
    function on () {
      // 移除事件
      vm.$off(event, on)
      // 执行回调
      fn.apply(vm, arguments)
    }
    on.fn = fn
    // 监听事件
    vm.$on(event, on)
    return vm
  }

  // 移除自定义事件，即从 vm._events 对象中找到对应的事件，移除所有事件或移除指定事件的回调函数
  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this
    // all vm.$off() 移除实例上的所有监听器
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events 移除一组事件
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // specific event 移除指定事件
    const cbs = vm._events[event]
    if (!cbs) {
      // 没有注册过该事件
      return vm
    }
    if (!fn) {
      // 没有提供回调函数，则移除该事件的所有回调函数
      vm._events[event] = null
      return vm
    }
    // specific handler 移除指定事件的指定回调函数
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  // 触发实例上的指定事件
  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    if (process.env.NODE_ENV !== 'production') {
      // 将事件名转换为小写
      const lowerCaseEvent = event.toLowerCase()
      // HTML属性不区分大小写，所以不能使用v-on监听小驼峰形式的事件名（eventName），应使用连字符形式的事件名（event-name）
      // 不同于组件和 prop，事件名不会被用作一个 JavaScript 变量名或 property 名，所以就没有理由使用 camelCase 或 PascalCase 了。
      // 并且 v-on 事件监听器在 DOM 模板中会被自动转换为全小写 (因为 HTML 是大小写不敏感的)，
      // 所以 v-on:myEvent 将会变成 v-on:myevent——导致 myEvent 不可能被监听到。
      // 因此，我们推荐你始终使用 kebab-case 的事件名。
      // 使用字符串模板或单文件组件，不会转换。
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        )
      }
    }
    // 获取当前事件的回调函数数组，依次调用，并传递提供的参数
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      const info = `event handler for "${event}"`
      for (let i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm
  }
}
