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
      ref: 'hoh'
    }, 'hello world!')
  },

  mounted () {
    console.log('refs', this.$refs['hoh'])
  }
})


window.v = v

// setTimeout(() => {
//   v.name = 'lly555'
// }, 2000)