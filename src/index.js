import Vue from 'vue'

let vm = new Vue({
  el: '#app',
  data() {
    return {
      msg: 'This is msg!',
      arr: [{a: 1}, 2, 3, [1]],
      obj: {
        name: 'Obj name'
      },
      firstName: 'Chester',
      lastName: 'Feng'
    }
  },
  watch: {
    // msg(oldValue, newValue) {
    //   console.log(oldValue, newValue)
    // }
    msg: {
      handler(newValue, oldValue) {
        console.log(newValue, oldValue)
      },
      immediate: true
    }
  },
  computed: {
    fullName() {
      return this.firstName + ' ' + this.lastName
    }
  }
})

setTimeout(() => {
  vm.msg = '111'
  vm.msg = '222'
  vm.msg = '333'
  vm.msg = 'aaa'
  vm.arr.push(6)
  vm.arr[0].a = 2
  vm.arr[3].push(2)
  vm.firstName = 'Chen'
}, 1000)
