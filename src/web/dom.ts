const webMethods = {
  query(selectorText: string): Element | null {
    return document.querySelector(selectorText)
  },
  append(parentNode: Node, node: Node) {
    parentNode.appendChild(node)
  },
  insertBefore(parentNode: Node, node: Node, refNode: Node | null) {
    parentNode.insertBefore(node, refNode)
  },
  remove(parentNode: Node, node: Node) {
    parentNode.removeChild(node)
  },
  parentNode(node: Node): Node | null {
    return node.parentNode
  },
  createElement(tag: string): Node {
    return document.createElement(tag)
  },
  createComment(text: string): Comment {
    return document.createComment(text)
  },
  createText(text: string): Text {
    return document.createTextNode(text)
  },
  setTextContent(node: Node, text: string) {
    return (node.textContent = text)
  },
  nextSibling(node: Node): Node | null {
    return node.nextSibling
  }
}

export default webMethods
