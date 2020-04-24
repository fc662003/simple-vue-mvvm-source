import { pushTarget, popTarget} from './dep'
import { nextTick } from './nextTick'
import { util } from '../utils'
let id = 0
class Watcher {
  /**
   * @param {*} vm  当前组件实例
   * @param {*} expOrFn 用户传入的表达式也可能是一个函数
   * @param {*} cb 用户传入的回调函数 vm.$watch('msg', cb)
   * @param {*} opts 一些其他参数
   */
  constructor(vm, expOrFn, cb = () => {}, opts = {}) {
    this.vm = vm
    this.expOrFn = expOrFn
    // 如果expOrFn 是一个函数, 将其付给watcher实例的getter属性
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      //  当不是函数的时候, 将个getter转成一个函数, 并用util的方法取出此时表达式expOrFn的值
      this.getter = function () {
        return util.getValue(vm, expOrFn)
      }
    }
    if (opts.user) { //标识是用户创建的watcher
      this.user = true
    }
    this.lazy = opts.lazy
    this.dirty = this.lazy
    this.cb = cb
    this.id = id++
    this.deps = []
    this.depsId = new Set()
    this.opts = opts
    this.immediate = opts.immediate
    // 创建watcher的时候, 现将表达式对应的值取出来(老值 oldValue)
    this.value = this.lazy ? undefined : this.get()
    if (this.immediate) {
      this.cb(this.value)
    }
  }

  get() {
    pushTarget(this)
    // 调用getter方法, 即表示, 如果new Watcher时第二个参数是个函数, 这个函数会在实例创建后执行
    let value = this.getter.call(this.vm)
    popTarget()
    return value
  }

  depend() {
    let i = this.deps.length
    while(i--) {
      this.deps[i].depend()
    }
  }

  update() {
    // this.get() 调用get方法又会调用getter(), 也就是会把watcher的方法执行一遍。但是直接调用this.get()会导致当属性多次赋值会多次更新，因此需要将watcher存起来，延迟执行watcher的方法、
    if (this.lazy) { // 如果是计算属性
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }

  evaluate() {
    this.value = this.get() // 此时会把计算属性的watcher放到stack里
    this.dirty = false
  }

  run() {
    let value = this.get()
    if (this.value !== value) {
      this.cb(value, this.value)
    }
  }

  addDep(dep) {
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)
    }
  }
}

let has = {}
let queue = []

function flushQueue() {
  // 等待当前这一轮全部更新之后，再让watcher执行方法
  queue.forEach(watcher => {
    watcher.run()
  })
  has = {}
  queue = []
}
function queueWatcher(watcher) {
  let id = watcher.id

  if (has[id] === undefined) {
    has[id] = true
    queue.push(watcher)

    nextTick(flushQueue)
  }
}

export default Watcher