import { ComponentPropsObject, VueProps, Vue } from '../../type'
import { hasOwn, isFunction, isArray, isUndef, isPlainObject, hyphenate } from '../../helper/utils'
import { warn } from '../../helper/warn'

interface ComponentProps {
  [key: string]: ComponentPropsObject
}

export function validateProp(
  key: string,
  propsOptions: ComponentProps,
  propsData: VueProps,
  vm: Vue
) {
  let prop: ComponentPropsObject = propsOptions[key]
  let absent: boolean = !hasOwn(propsData, key)
  let value: any = propsData[key]

  // 处理boolean值
  let booleanIndex = getTypeIndex(Boolean, prop.type)
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      // 处理如下调用形式<button-count show-value>，showValue=true
      let stringIndex = getTypeIndex(String, prop.type)
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
    }
  }

  if (isUndef(value)) {
    value = getPropDefaultValue(vm, prop, key)
  }

  assertProp(prop, key, value, vm, absent)
  return value
}

function getPropDefaultValue(vm: Vue, prop: ComponentPropsObject, key: string): any {
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  let def = (prop as any).default
  if (isFunction(def) && getType((prop as any).type) !== 'function') {
    return def.call(vm)
  } else {
    return def
  }
}

function getTypeIndex(type: Function, expectedType: any) {
  if (!isArray(expectedType)) {
    return isSameType(expectedType, type) ? 0 : -1
  }
  for (let i = 0, len = expectedType.length; i < len; ++i) {
    if (isSameType(expectedType[i], i)) {
      return i
    }
  }
  return -1
}

function isSameType(a: any, b: any): boolean {
  return getType(a) === getType(b)
}

function getType(val: any): string {
  var match = val && val.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

// 断言props的类型是否符合要求
function assertProp(
  prop: ComponentPropsObject,
  name: string,
  value: any,
  vm: Vue,
  absent: boolean
): any {
  if ((prop as any).required && absent) {
    return warn(`Missing required prop: "${name}"`)
  }

  if (value === null && !(prop as any).required) {
    return
  }

  let type = prop.type
  let valid = !type || type === true
  let exceptedTypes = []
  if (type) {
    if (!isArray(type)) type = [type]
    for (let i = 0, len = (type as Array<any>).length; i < len; ++i) {
      let assertedType = assertType(value, type[i])
      exceptedTypes.push(assertedType.expectedType || '')
      valid = assertedType.valid
    }
  }

  if (!valid) {
    return warn('props 类型错误')
  }

  let validator = prop.validator
  if (validator && !validator(value)) {
    return warn(`Invalid prop: custom validator check failed for prop "${name}"`)
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/
function assertType(value: any, type: any) {
  let valid: boolean
  let expectedType: string = getType(type)
  if (simpleCheckRE.test(expectedType)) {
    let t = typeof value
    valid = t === expectedType.toLowerCase()
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value)
  } else if (expectedType === 'Array') {
    valid = isArray(value)
  } else {
    valid = value instanceof type
  }

  return {
    valid,
    expectedType
  }
}
