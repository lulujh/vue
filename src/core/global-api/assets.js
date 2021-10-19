/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   * 定义 Vue.component、Vue.directive、Vue.filter 这三个方法
   * 这三个方法所做的事情类似，就是在 this.options.xxx 上存放对应的配置
   * 如：Vue.component(compName, {xxx}) 结果是 this.options.components.compName = 组件构造函数
   */

  //  const ASSET_TYPES = [
  //   'component',
  //   'directive',
  //   'filter'
  // ]
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
          // 如果组件配置中存在 name，则使用，否则用 id
          definition.name = definition.name || id
          // this.options._base.extend 就是 Vue.extend
          // 这时的 definition 就变成了组件构造函数，使用时可直接 new definition()
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          // 如果是函数转换为对象，所以将会被 bind 和 update 调用
          definition = { bind: definition, update: definition }
        }
        // 如 this.options.components[id] = definition
        // 在实例化时通过 mergeOptions 将全局注册的组件合并到每个组件的配置对象的 components 中
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
