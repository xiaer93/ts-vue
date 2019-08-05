import Vue from '../../src/index'

let v = new Vue({
  el: '#app',
  data () {
    return {
      name: 'cjw'
    }
  },
  render (h) {
    return h('h1', 'hello world!' + this.name)
  }
})


window.v = v

setTimeout(() => {
  v.name = 'lly'
}, 2000)