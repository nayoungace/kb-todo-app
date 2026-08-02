import { HttpError } from './http-error'

const FALLBACK_MESSAGE = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'

export function toErrorMessage(error: unknown): string {
  return error instanceof HttpError ? error.message : FALLBACK_MESSAGE
}
