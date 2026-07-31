interface TaskDetailPageProps {
  id: string
}

export function TaskDetailPage({ id }: TaskDetailPageProps) {
  return (
    <section>
      <h1 className="text-2xl font-bold">할 일 상세</h1>
      <p className="text-muted-foreground mt-2">id: {id}</p>
    </section>
  )
}
