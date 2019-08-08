export interface WatchOptions {
  computed?: boolean
  user?: boolean
  before?: () => void
}

export interface Watch {
  value: any
  evaluate: () => void
  depend: () => void
  teardown: () => void
}
