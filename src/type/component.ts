type DataType = Number | String | Boolean | Object | any

interface ComponentPropsValueObject {
  type: Array<DataType> | DataType
  default?: any
  validator?: (value: any) => boolean
}

export interface ComponentPropsObject {
  [key: string]: Array<DataType> | DataType | ComponentPropsValueObject
}

export interface ComponentProps {
  [key: string]: ComponentPropsObject | Array<any>
}
