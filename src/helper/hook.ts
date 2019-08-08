import { VueHookMethod, Vue } from '../type'
import { invokeWithErrorHandling } from './warn'

export function callhook(vm: Vue, hooks: VueHookMethod) {
  const handlers = vm.$options[hooks] as Array<Function>
  for (let h of handlers) {
    invokeWithErrorHandling(h, [], vm)
  }
}
