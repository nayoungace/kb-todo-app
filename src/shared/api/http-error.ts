export class HttpError extends Error {
  readonly status: number

  constructor(status: number, errorMessage: string) {
    super(errorMessage)
    this.name = 'HttpError'
    this.status = status
  }
}
