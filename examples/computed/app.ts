import Vue from "../../src";

let runCount = 0

let v = new Vue({
  el: '#app',
  data () {
    return  {
        news: [1],
        firstName: 'cheng',
        lastName: 'xiaohong'
    }
  },
  computed: {
    newsStr() {
      return this.news.length.toString()
    },
    fullName:　{
      get() {
        return this.firstName + ' ' + this.lastName
      },
      set(newValue) {
        var names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[1]
      }
    }
  },
  render (h) {
    console.log('render: ', ++runCount)
    return h('h1', this.fullName + '，未读消息：' + this.newsStr)
  }
})

window.v = v

setTimeout(() => {
    v.fullName = 'cheng xiaoming'
}, 1000)