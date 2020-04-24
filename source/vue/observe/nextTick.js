let callbacks = []
function flushCallbacks() {
  callbacks.forEach(cb => {
    cb()
  })
}
export function nextTick(cb) {
  callbacks.push(cb)

  let timeFunc = () => {
    flushCallbacks()
  }

  if(Promise) {
    return Promise.resolve().then(timeFunc)
  }

  if(MutationObserver) {
    let observe = new MutationObserver(timeFunc)
    let textNode = document.createTextNode(1)
    observe.observe(textNode, {characterData: true})
    textNode.textContent = 2
    return
  }

  if(setImmediate) {
    return setImmediate(timeFunc)
  }

  setTimeout(() => {
    timeFunc()
  }, 0)
}