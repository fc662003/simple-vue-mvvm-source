import { initState } from './observe/index'
import Watcher from './observe/watcher'
import { compiler } from './utils'
// 使用ES5构造方式的形式创建Vue'类'. 这样可以使用Vue.prototype的形式在构造函数外部来添加实例的原型方法. 如果使用ES6的 Class方式, 所有的方法需要卸载Class Vue {} 内部
function Vue(options) {
  this._init(options)
}

// init初始化实例方法
Vue.prototype._init = function(options) {
  // 将this赋值给vm 此时的this即是new Vue出来的实例
  let vm = this
  // 将new Vue是传递给构造方式的各种选项. data computed watch...
  vm.$options = options

  //MVVM原理 将数据响应式化 data computed watch
  initState(vm)

  // 如果new Vue时传递的选项中包含el选项, 意味着需要将Vue实例挂载在el对应的元素上.
  if (vm.$options.el) {
    vm.$mount()
  }
}

Vue.prototype._update = function() {
  let vm = this
  let el = vm.$el

  // 创建一个documentFragment. 用来将操作数据和HTML模板, 最后能一次性将编译好的HTML通过DOM操作的形式放到页面
  let node = document.createDocumentFragment()
  let firstChild
  while (firstChild = el.firstChild) {
    node.appendChild(firstChild)
  }

  // 编译, 将HTML和数据结合
  compiler(node, vm)
  el.appendChild(node)
}

function query(el) {
  if (typeof el === 'string') {
    el = document.querySelector(el)
  }
  return el
}

Vue.prototype.$mount = function() {
  let vm = this
  let el = vm.$options.el
  // 将挂载的元素变成dom对象, 并存放在实例的$el属性上
  el = vm.$el = query(el)

  // 渲染watcher的回调方法
  let updateComponent = () => {
    vm._update()
  }
  new Watcher(vm, updateComponent)
}

Vue.prototype.$watch = function(expr, handler, opts) {
  let vm = this
  new Watcher(vm, expr, handler, {user: true, ...opts})
}
export default Vue
