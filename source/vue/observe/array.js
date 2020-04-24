 import { observe } from './index'
 let oldArrayProtoMethods = Array.prototype

 // 创造一个arrayMethods实例, 继承自Array的原型
 export let arrayMethods = Object.create(oldArrayProtoMethods)

 export function observeArray(inserted) {
   for (let i = 0; i < inserted.length; i++) {
     let element = inserted[i]
     observe(element)
   }
 }

 export function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    const element = value[i]
    element.__ob__ && element.__ob__.dep.depend()
    if (Array.isArray(element)) {
      dependArray(element)
    }
  }
 }

 // 会改变原数组的方法
 let methods = [
   'push',
   'pop',
   'shift',
   'unshift',
   'reverse',
   'sort',
   'splice'
 ]

 methods.forEach(method => {
   arrayMethods[method] = function(...args) {
     // 调用数组原始的方法
    let result = oldArrayProtoMethods[method].apply(this, args)

    let inserted = null
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args // args是调用push, unshift方法时插入的新数组元素
        break;
      case 'splice':
        inserted = args.slice(2)
      default:
        break;
    }
    if (inserted) {
      observeArray(inserted)
    }
    this.__ob__.dep.notify()
    return result
   }
 })