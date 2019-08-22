type DataType = Number | String | Boolean | Object | Array<any>

// export type ComponentPropsType = Array<DataType> | DataType | ComponentPropsObj
export type ComponentPropsType = ComponentPropsObj

interface ComponentPropsObj {
  type: Array<DataType> | DataType
  default?: any
  validator?: (value: any) => boolean
}

export interface ComponentProps {
  [key: string]: ComponentPropsType
}
