import Vue from '../../src/index'

let v = new Vue({
  el: '#app',
  data () {
    return {
      name: 'cjw'
    }
  },
  render (h) {
    return h('h1', {
      style: {
        color: this.name.length === 3? 'red' : '#000'
      }
    }, 'hello world!' + this.name)
  }
})


window.v = v

setTimeout(() => {
  v.name = 'lly555'
}, 2000)