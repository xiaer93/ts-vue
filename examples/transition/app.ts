import Vue from "../../src";

let runCount = 0

let v = new Vue({
  el: '#app',
  data () {
    return  {
        show: true
    }
  },
  render (h) {
    const self = this
    return h('transition', {props: {name: 'fade'}}, [
      h('p', {
        class: {
          message: true
        },
      directives: [
        {
            name: 'show',
            value: self.show,
            expression: 'self.show', 
            arg: '',
            modifiers: { }
        }
    ]
    }, 'hello world!')
  ])
  }
})

window.v = v

// setTimeout(() => {
//   console.log('show')
//   debugger
//   v.show = true
// }, 5000)
