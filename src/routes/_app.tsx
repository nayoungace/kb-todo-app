import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/widgets/app-shell'

export const Route = createFileRoute('/_app')({
  component: AppShell,
})
