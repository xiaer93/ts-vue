import { isUndef } from './utils'

export function warn(message: string): void {
  console.warn(message)
  // throw new Error(message)
}

const proyWindow = window
export function invokeWithErrorHandling(fn: Function, args: Array<any>, context?: Object) {
  try {
    // 绑定函数上下文
    fn.apply(isUndef(context) ? proyWindow : context, args)
  } catch (e) {
    console.log(e)
  }
}
