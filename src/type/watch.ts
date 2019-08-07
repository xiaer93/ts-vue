export interface WatchOptions {
  computed?: boolean
  user?: boolean
}

export interface Watch {
  value: any
  evaluate: () => void
  depend: () => void
}
