export interface WatchOptions {
  deep?: boolean
  sync?: boolean
  lazy?: boolean
  user?: boolean
  before?: () => void
}

export interface Watch {
  value: any
  evaluate: () => void
  depend: () => void
  teardown: () => void
}
