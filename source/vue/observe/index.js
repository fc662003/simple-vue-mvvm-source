import Observer from'./observer'
import Watcher from './watcher'
import Dep from './dep'
// vm参数即为Vue实例
export function initState(vm) {
  let opts = vm.$options // 拿到Vue实例中的选项

  // 如果选项中配置了data, 则将data中的各个值响应式化
  if (opts.data) {
    initData(vm)
  }

  if (opts.computed) {
    initComputed(vm, opts.computed)
  }

  if (opts.watch) {
    initWatch(vm)
  }
}

// 将数据响应式化
export function observe(data) {
  if (typeof data !== 'object' || data == null) {
    return
  }

  if (data.__ob__) {
    return
  }

  return new Observer(data)
}

// 将source中的值代理成vm中的属性, 在使用vm.XX访问的时候实际还是调用的vm._data下的XX. 意味着vm.XX指向的地方和vm._data.XX是一个地方. 当修改vm.XX改变也会引起vm._data.XX改变, 反之亦然.
function Proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newVal) {
      vm[source][key] = newVal
    }
  })
}

// 初始化数据
function initData(vm) {
  let data = vm.$options.data
  // 如果data选项是一个函数, 则将函数执行, 将其结果作为data, 同时挂载在实例的_data属性上. 如果data选项是不是函数, 则直接作为data, 同时挂载在实例的_data属性上.
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

  // 将data中的每个值直接代理到成为vm实例自己的属性
  for ( let key in data) {
    Proxy(vm, '_data', key)
  }

  observe(vm._data)
}

function createComputedGetter(vm, key) {
  let watcher = vm._watchersComputed[key] // 计算属性的watcher
  return function (params) { //取计算属性的值是走这个方法
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function initComputed(vm, computed) {
  let watchers = vm._watchersComputed = Object.create(null) // 创建存储计算属性的对象

  for (const key in computed) {
    if (computed.hasOwnProperty(key)) {
      let userDef = computed[key]
      watchers[key] = new Watcher(vm, userDef, () => {}, {lazy: true}) // 计算属性, 刚开始这个方法不会执行

      Object.defineProperty(vm, key, {
        get: createComputedGetter(vm, key)
      })
    }
  }
}

function createWatcher(vm, key, handler, opts) {
  return vm.$watch(key, handler, opts)
}

function initWatch(vm) {
  let watch = vm.$options.watch
  for (const key in watch) {
    if (watch.hasOwnProperty(key)) {
      const userDef = watch[key]
      let handler = userDef
      if (userDef.handler) {
        handler = userDef.handler
      }
      createWatcher(vm, key, handler, {immediate: userDef.immediate})
    }
  }
}

