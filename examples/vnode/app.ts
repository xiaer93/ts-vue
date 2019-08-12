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
      },
      class: {
        foo: true,
        bar: false
      },
      // 普通html特性
      attrs: {
        id: 'fff'
      },
      props: {
        title: 'aaa'
      },
      // dom属性
      domProps: {
        innerHTML: 'baz'
      },

      // 事件有两条线，1.组件的事件是listeners；2.标签和.native事件是on；二者处理方式不同
      on: {
        click () {console.log('hhhh')}
      },
      // 指的是使用了后缀修饰符.native的事件
      nativeOn: {
        click () {console.log('nhnhnhnh')}
      },
    }, 'hello world!' + this.name)
  }
})


window.v = v

// setTimeout(() => {
//   v.name = 'lly555'
// }, 2000)