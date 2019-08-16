import Vue from "../../src";

let runCount = 0

Vue.component('app-layout', {
  render (h) {
    const self = this

    return h('div', [
      h('header', [self._t('header')]),
      h('main', [self._t('default', [h('', '默认内容')])]),
      h('footer', [self._t('footer')])
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
    return h('div', [
      h('app-layout', [
        h('h1', {attrs: {slot: 'header'}, slot: 'header'}, this.title),
        h('p', this.msg),
        h('p', {attrs: {slot: 'footer'}, slot: 'footer'}, this.desc)
      ])
    ])
  }
})

window.v = v

// setTimeout(() => {
//   v.title = 'change title!'
// }, 5000)
