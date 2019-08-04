// import {VNode} from '../../src/core/vnode'
import { createElement } from '../../src/core/vnode'

describe('vnode', () => {
  describe('createElement', () => {
    it('create an text vnode', () => {
      let v = createElement('h1', 'hello world!')
      expect(v.tag).toBe('h1')
      expect(v.text).toBe('hello world!')
      expect(v.children).toBeUndefined()
    })
    it('create a children vnode', () => {
      let v = createElement('h1', [createElement('span', 'hello world!')])
      expect(v.tag).toBe('h1')
      let child = (v.children as Array<any>)[0]
      expect(child.tag).toBe('span')
      expect(child.text).toBe('hello world!')
    })
    it('create a comment vnode', () => {
      let v = createElement('!', 'hello world!')
      expect(v.tag).toBe('!')
      expect(v.text).toBe('hello world!')
      expect(v.children).toBeUndefined()
    })
  })
})
