import Vue from "../../src";

let runCount = 0

let v = new Vue({
  el: '#app',
  data () {
    return  {
      question: '',
      answer: 'I cannot give you an answer until you ask a question!'
    }
  },
  watch: {
    // 如果 `question` 发生改变，这个函数就会运行
    question: function (newQuestion, oldQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.debouncedGetAnswer()
    }
  },
  created: function () {
    // `_.debounce` 是一个通过 Lodash 限制操作频率的函数。
    // 在这个例子中，我们希望限制访问 yesno.wtf/api 的频率
    // AJAX 请求直到用户输入完毕才会发出。想要了解更多关于
    // `_.debounce` 函数 (及其近亲 `_.throttle`) 的知识，
    // 请参考：https://lodash.com/docs#debounce
    this.debouncedGetAnswer = _.debounce(this.getAnswer, 500)
  },
  methods: {
    getAnswer: function () {
      if (this.question.indexOf('?') === -1) {
        this.answer = 'Questions usually contain a question mark. ;-)'
        return
      }
      this.answer = 'Thinking...'
      var vm = this
      
      axios.get('https://yesno.wtf/api')
        .then(function (response) {
          vm.answer = _.capitalize(response.data.answer)
        })
        .catch(function (error) {
          vm.answer = 'Error! Could not reach the API. ' + error
        })
    }
  },
  render (h) {
    const self = this
    console.log('render: ', ++runCount)
    return h('div', [
      h('p', [
        h('span', 'Ask a yes/no question'),
        h('input', {
          on: {
            input(e) {
              self.question = e.target.value
            }
          },
          attrs: {
            value: this.question
          }
        })
      ]),
      h('p', this.answer)
    ])
  }
})

window.v = v

// setTimeout(() => {
//   // fixme: v.news = [1,2,3]
//   // fixme: v.news.push(3)
//   // 为什么没有驱动更新？,push3触发了watch，newsStr变化触发了watch。在执行watch中触发了watch，因此需要将watch添加进入队列
//     // v.news.push(3)
//     v.news = [1,2,3]
// }, 1000)

// setTimeout(() => {
//   v.news.push(4)
// }, 5000)