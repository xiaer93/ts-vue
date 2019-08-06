import { createPatcher } from './patch'
import modules from './modules'

const patch = createPatcher(modules)

export default patch
