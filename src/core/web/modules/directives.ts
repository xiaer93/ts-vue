import { VNode, VNodeDirective, Vue } from '../../../type'
import { emptyNode } from '../patch'
import { isUndef, resolveAsset } from '../../../helper/utils'
import { mergeVNodeHook } from '../../vnode'

function updateDirectives(oldVnode: VNode, vnode: VNode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode)
  }
}

function _update(oldVnode: VNode, vnode: VNode) {
  const isCreate: boolean = oldVnode === emptyNode
  const isDestroy: boolean = vnode === emptyNode
  const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context)
  const newDirs = normalizeDirectives(vnode.data.directives, vnode.context)

  const dirsWithInsert = []
  const dirsWithPostpatch = []

  let oldDir: any, dir: any
  for (let key in newDirs) {
    oldDir = oldDirs[key]
    dir = newDirs[key]
    if (!oldDir) {
      callhook(dir, 'bind', vnode, oldVnode)
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      dir.oldValue = oldDir.value
      dir.oldArg = oldDir.arg
      callhook(dir, 'update', vnode, oldVnode)
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir)
      }
    }
  }

  if (dirsWithInsert.length) {
    const callInsert = () => {
      for (let i = 0, len = dirsWithInsert.length; i < len; ++i) {
        callhook(dirsWithInsert[i], 'inserted', vnode, oldVnode)
      }
    }
    if (isCreate) {
      // 指令依赖vnode-hook去实现
      mergeVNodeHook(vnode, 'insert', callInsert)
    } else {
      callInsert()
    }
  }

  if (dirsWithPostpatch) {
    mergeVNodeHook(vnode, 'postpatch', () => {
      for (let i = 0, len = dirsWithPostpatch.length; i < len; ++i) {
        callhook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode)
      }
    })
  }
}

const emptyModifiers = Object.create(null)
function normalizeDirectives(directives?: Array<VNodeDirective>, vm?: Vue) {
  const res = Object.create(null)
  if (isUndef(directives)) {
    return res
  }

  for (let i = 0, len = directives.length; i < len; ++i) {
    let dir = directives[i]
    if (!dir.modifiers) {
      dir.modifiers = emptyModifiers
    }
    res[getRawDirName(dir)] = dir
    // 获取预定义好的指令功能
    dir.def = resolveAsset(vm.$options, 'directives', dir.name)
  }

  return res
}

function getRawDirName(dir: VNodeDirective) {
  return `${dir.name}.${Object.keys(dir.modifiers || {}).join('.')}`
}

function callhook(
  dir: VNodeDirective,
  hook: string,
  vnode: VNode,
  oldVnode: VNode,
  isDestroy?: boolean
) {
  const fn = dir.def && dir.def[hook]
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy)
    } catch (e) {
      console.log(e)
    }
  }
}

export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives(vnode: VNode) {
    updateDirectives(vnode, emptyNode)
  }
}
