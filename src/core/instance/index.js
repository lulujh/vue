import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// Vue 构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 Vue.prototype._init
  this._init(options)
}

// 定义 Vue.prototype._init
initMixin(Vue)
// Vue.prototype.$data $props $set $delete $watch
stateMixin(Vue)
// Vue.prototype.$on $once $off $emit
eventsMixin(Vue)
// Vue.prototype._update $forceUpdate $destroy
lifecycleMixin(Vue)
// Vue.prototype.$nextTick Vue.prototype._render
renderMixin(Vue)

export default Vue
