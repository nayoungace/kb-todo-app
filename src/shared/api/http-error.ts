export class HttpError extends Error {
  readonly status: number
  readonly authenticated: boolean

  constructor(status: number, errorMessage: string, authenticated = true) {
    super(errorMessage)
    this.name = 'HttpError'
    this.status = status
    this.authenticated = authenticated
  }
}
