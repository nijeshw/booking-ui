export type SettingValue = boolean | number | string

export interface ISettingOption {
  value: string
  label: string
}

export interface ISettingField {
  key: string
  label: string
  description: string
  type: 'boolean' | 'number' | 'string'
  value: SettingValue
  options?: ISettingOption[]
}

export interface ISettingGroup {
  label: string
  items: ISettingField[]
}

export interface ISettingCatalog {
  groups: ISettingGroup[]
}
