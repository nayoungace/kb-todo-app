import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/shadcn/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/shadcn/ui/dialog'
import { Field, FieldLabel } from '@/shared/shadcn/ui/field'
import { Input } from '@/shared/shadcn/ui/input'
import { useDeleteTask } from '../model/use-delete-task'

interface DeleteTaskDialogProps {
  id: string
}

export function DeleteTaskDialog({ id }: DeleteTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const { deleteTask, isPending } = useDeleteTask(id, () => setOpen(false))

  const schema = useMemo(
    () => z.object({ confirmId: z.string().refine((value) => value.trim() === id) }),
    [id],
  )
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<{ confirmId: string }>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { confirmId: '' },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 />
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(() => deleteTask())} noValidate>
          <DialogHeader>
            <DialogTitle>할 일 삭제</DialogTitle>
            <DialogDescription>
              삭제하면 되돌릴 수 없습니다. 삭제하려면 아래 입력란에{' '}
              <strong className="text-foreground font-medium">{id}</strong>을(를) 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <Field className="my-6">
            <FieldLabel htmlFor="confirm-id">할 일 id</FieldLabel>
            <Input id="confirm-id" autoComplete="off" {...register('confirmId')} />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                취소
              </Button>
            </DialogClose>
            <Button variant="destructive" type="submit" disabled={!isValid || isPending}>
              제출
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
