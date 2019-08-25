import Vue from "../../src";

let runCount = 0

Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },

  render (h) {
    const self = this
    return h('button', {
      on: {
        click() {
          console.log('click')
          // fixme: 在vue中，此处同样指向window（根据定义函数的作用域确定）
          this.count += 1
          self.count += 1
          
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
          level: 1,
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
