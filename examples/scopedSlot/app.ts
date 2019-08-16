import Vue from "../../src";

let runCount = 0

Vue.component('child', {
  data () {
    return {
      msg: '来自child 作用域插槽'
    }
  },
  render (h) {
    const self = this

    return h('div', [
      h('main', [self._t('default', null, {text: 'Hello ', msg: this.msg})])
    ])
  }
})

let v = new Vue({
  el: '#app',
  data () {
    return  {
        title: 'hello world!',
        msg: 'msg',
        desc: 'desc'
    }
  },
  render (h) {
    const self = this
    return h('div', [
      h('child', {
        scopedSlots: self._u([
          {
            key: 'default',
            fn: function (props) {
              return [
                h('p', 'hello from parent'),
                h('p', props.text + props.msg)
              ]
            }
          }
        ])
      })
    ])
  }
})

window.v = v

// setTimeout(() => {
//   v.title = 'change title!'
// }, 5000)
