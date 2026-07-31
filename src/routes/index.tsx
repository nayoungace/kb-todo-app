import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold">kb-todo-app</h1>
      <p className="text-text-muted mt-2">
        Hello World! 라우터, 색상 토큰, 폰트 적용 버전.
      </p>
      <div className="mt-6 flex gap-2">
        <span className="bg-primary text-on-primary rounded-md px-3 py-1.5 text-sm">primary</span>
        <span className="bg-disabled text-on-disabled rounded-md px-3 py-1.5 text-sm">
          disabled
        </span>
      </div>
    </section>
  )
}
