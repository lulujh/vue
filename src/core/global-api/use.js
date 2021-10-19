/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  // 负责为Vue安装插件
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 判断插件是否已经安装
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    // 将 Vue 构造函数放到第一个参数位置，然后将这些参数传递给 install 方法
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      // plugin是一个对象，则执行其 install 方法安装插件
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // plugin是函数，直接执行该方法安装插件
      plugin.apply(null, args)
    }
    // 添加到插件列表中
    installedPlugins.push(plugin)
    return this
  }
}
