export function warn(message: string): void {
  console.warn(message)
  throw new Error(message)
}

export function invokeWithErrorHandling(fn: Function, args: Array<any>, context: Object) {
  try {
    // 绑定函数上下文
    fn.apply(context, args)
  } catch (e) {
    console.log(e)
  }
}
