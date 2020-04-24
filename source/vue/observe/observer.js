import { observe } from './index'
import { arrayMethods, observeArray, dependArray } from './array'
import Dep from './dep'
// 为每个key添加get set方法, 这样可以在获取数据和改变数据的时候做一些事
export function defineReactive(data, key, value) {
  // key对应的值如果是对象或数组，同样需要响应式化
  let childOb = observe(value)
  let dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        // dep.addSub(Dep.target)
        dep.depend()

        if (childOb) {
          childOb.dep.depend()
          dependArray(value)
        }
      }
      return value
    },
    set(newValue) {
      if (value !== newValue) {
        observe(newValue)
        value = newValue
        dep.notify()
      }
    }
  })
}

// Observer类, 用来将数据进行响应式化
class Observer {
  constructor(data) {
    // 如果需要处理的数据是数组, 采用数组方法劫持的方法
    this.dep = new Dep() // 专门用在数组上
    Object.defineProperty(data, '__ob__', {
      get: () => {
        return this
      }
    })
    if (Array.isArray(data)) {
      // 改变数据的原型指向, 这样数组的改变原数组的那些方法都会被拦截, 新插入的数据都会被响应式化
      data.__proto__ = arrayMethods
      // 数组中的每个元素都需要响应式化
      observeArray(data)
    } else {
      this.walk(data)
    }
  }

  walk(data) {
    // 拿到数据对象自己的(非原型链上的)所有可以迭代的key
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      let value = data[key]
      defineReactive(data, key, value)
    }
  }
}

export default Observer