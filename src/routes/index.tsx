import { createFileRoute } from '@tanstack/react-router'

import { Button } from '@/shared/shadcn/ui/button'

export const Route = createFileRoute('/')({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold">kb-todo-app</h1>
      <p className="text-muted-foreground mt-2">
        Hello World! 라우터, 색상 토큰, 폰트, shadcn/ui 적용 버전.
      </p>
      <div className="mt-6 flex gap-2">
        <Button>primary</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="outline">outline</Button>
        <Button disabled>disabled</Button>
      </div>
    </section>
  )
}
