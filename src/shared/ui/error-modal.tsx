import { useSyncExternalStore } from 'react'
import { errorModalStore } from '@/shared/lib/error-modal-store'
import { Button } from '@/shared/shadcn/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/shadcn/ui/dialog'

export function ErrorModal() {
  const message = useSyncExternalStore(errorModalStore.subscribe, errorModalStore.get)

  return (
    <Dialog
      open={message !== null}
      onOpenChange={(open) => {
        if (!open) errorModalStore.close()
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>오류</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => errorModalStore.close()}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
