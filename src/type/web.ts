import { VNode } from './vnode'

// export type PreHook = () => any
export type InitHook = (vnode: VNode) => any
export type PrepatchHook = (oldVnode: VNode, vnode: VNode) => any
export type PostpatchHook = (oldVnode: VNode, vnode: VNode) => any
export type CreateHook = (emptyNode: VNode, vnode: VNode) => any
export type InsertHook = (VNode: VNode) => any
export type UpdateHook = (oldVnode: VNode, vnode: VNode) => any
export type RemoveHook = (vnode: VNode, removeCallback: () => void) => any
export type DestroyHook = (vnode: VNode) => any

// export interface Hooks {
//   create?: CreateHook
//   insert?: InsertHook
//   update?: UpdateHook
//   remove?: RemoveHook
//   destroy?: DestroyHook
// }

export interface Module {
  init: InitHook
  prepatch: PrepatchHook
  postpatch: PostpatchHook
  create: CreateHook
  insert: InsertHook
  update: UpdateHook
  remove: RemoveHook
  destroy: DestroyHook
}

export type Hooks = Partial<Module>
