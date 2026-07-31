import { CircleUserRound, LayoutDashboard, ListTodo, LogIn } from 'lucide-react'
import { ROUTES } from './routes'

export const NAV_MAIN = [
  { title: '대시보드', url: ROUTES.DASHBOARD, icon: LayoutDashboard, fuzzy: false },
  { title: '할 일', url: ROUTES.TASK, icon: ListTodo, fuzzy: true },
] as const

const NAV_USER = { title: '회원정보', url: ROUTES.USER, icon: CircleUserRound } as const
const NAV_SIGN_IN = { title: '로그인', url: ROUTES.SIGN_IN, icon: LogIn } as const

export function getAuthNavItem(isAuthenticated: boolean) {
  return isAuthenticated ? NAV_USER : NAV_SIGN_IN
}
