export function makeMap(str: string, expectsLowerCase?: boolean): (key: string) => true | void {
  const map = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

const raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout

// 下一帧
export function nextFrame(fn: FrameRequestCallback): Number {
  const frame: FrameRequestCallback = () => {
    return raf(fn)
  }
  return raf(frame)
}
