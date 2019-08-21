import Vue from "../../src";

let runCount = 0

let v = new Vue({
  el: '#app',
  data () {
    return  {
        news: [1],
        firstName: 'cheng',
        lastName: 'jw'
    }
  },
  computed: {
    newsStr() {
      console.log('cc:', this.news.length)
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
    return h('h1', this.newsStr + this.fullName)
  }
})

window.v = v

setTimeout(() => {
    // v.news = [1,2,3]
    v.fullName = 'cheng ly'
}, 1000)

setTimeout(() => {
  // v.news.push(4)
}, 5000)