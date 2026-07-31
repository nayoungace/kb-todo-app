import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthRepository, establishSession } from '@/entities/session'
import { HttpError } from '@/shared/api'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/shadcn/ui/button'
import { Card, CardContent } from '@/shared/shadcn/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/shadcn/ui/field'
import { Input } from '@/shared/shadcn/ui/input'
import { KbLogo } from '@/shared/ui/kb-logo'

const signInSchema = z.object({
  email: z.email('email 형식이 올바르지 않습니다'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(24, '비밀번호는 24자 이하여야 합니다')
    .regex(/^[A-Za-z0-9]+$/, '비밀번호는 영문과 숫자만 사용할 수 있습니다'),
})

type SignInFormValues = z.infer<typeof signInSchema>

export function SignInPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  const signInMutation = useMutation({
    mutationFn: AuthRepository.signIn,
    onSuccess: (tokens) => {
      establishSession(tokens)
      void navigate({ to: ROUTES.DASHBOARD })
    },
  })

  const errorMessage =
    signInMutation.error instanceof HttpError ? signInMutation.error.message : null

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form
              className="p-6 md:p-8"
              onSubmit={handleSubmit((values) => signInMutation.mutate(values))}
              noValidate
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">로그인</h1>
                  <p className="text-muted-foreground text-balance">
                    KB TODO 계정으로 로그인하세요.
                  </p>
                </div>
                <Field data-invalid={Boolean(errors.email)}>
                  <FieldLabel htmlFor="email">이메일</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nayoungace@github.com"
                    aria-invalid={Boolean(errors.email)}
                    {...register('email')}
                  />
                  <FieldError errors={[errors.email]} />
                </Field>
                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor="password">비밀번호</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    {...register('password')}
                  />
                  <FieldError errors={[errors.password]} />
                </Field>
                {/* TODO: 공용 에러 모달 도입 시 대체 */}
                {errorMessage && <FieldError>{errorMessage}</FieldError>}
                <Field>
                  <Button type="submit" disabled={!isValid || signInMutation.isPending}>
                    로그인
                  </Button>
                </Field>
              </FieldGroup>
            </form>
            <div className="bg-muted hidden items-center justify-center md:flex">
              <div className="flex flex-col items-center gap-4">
                <KbLogo className="size-24 rounded-3xl text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
