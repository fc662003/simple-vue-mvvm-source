const re = /\{\{((?:.|\r?\n)+?)\}\}/g
export const util = {
  getValue(vm, expr) {
    let keys = expr.split('.')
    return keys.reduce((memo, current) => {
      memo = memo[current]
      return memo
    }, vm)
  },
  // 通过正则表达式解析 HTML中 {{}}, 从而将值取出来
  compilerText(node, vm) {
    if (!node.expr) {
      node.expr = node.textContent
    }
    node.textContent = node.expr.replace(re, function(...args) {
      return JSON.stringify(util.getValue(vm, args[1]))
    })
  }
}

export function compiler(node, vm) {
  let childNodes = node.childNodes;
  [...childNodes].forEach(child => {
    if (child.nodeType === 1) {
      compiler(child, vm)
    } else {
      util.compilerText(child, vm)
    }
  })
}