import { authHandlers } from './handlers/auth'
import { dashboardHandlers } from './handlers/dashboard'
import { taskHandlers } from './handlers/task'
import { userHandlers } from './handlers/user'

export const handlers = [...authHandlers, ...userHandlers, ...dashboardHandlers, ...taskHandlers]
