import { CreateElement } from '../type/vnode'

export default class Vue {
  render(h: CreateElement) {
    return h('h1', 'hello world!')
  }
}
