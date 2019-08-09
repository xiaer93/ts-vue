import Vue from "../../src";

let runCount = 0

Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },

  render (h) {
    console.log('renderrenderrenderrenderrenderrenderrenderrender')
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

Vue.component("anchored-heading", {
  render: function(createElement) {
    return createElement(
      "h" + this.level, // 标签名称
      this.title // 子节点数组
    );
  },
  props: {
    level: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: "default-title"
    }
  }
});

let v = new Vue({
  el: '#app',
  data () {
    return  {
        title: 'hello world!'
    }
  },
  render (h) {
    return h('div', [
      h('button-counter'),
      h('anchored-heading', {
        props: {
          level: 3,
          title: this.title
        }
      })
    ])
  }
})

window.v = v

setTimeout(() => {
  v.title = 'change title!'
}, 5000)
