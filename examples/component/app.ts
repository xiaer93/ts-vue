import Vue from "../../src";

let runCount = 0

Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },

  render (h) {
    console.log('render')
    return h('button', {
      on: {
        click() {
          console.log('click')
          this.count += 1
        }
      }
    }, `you click ${this.count}`)
  }
})

let v = new Vue({
  el: '#app',
  data () {
    return  {
        news: [1,2]
    }
  },
  render (h) {
    return h('div', [
      h('button-counter')
    ])
  }
})

window.v = v