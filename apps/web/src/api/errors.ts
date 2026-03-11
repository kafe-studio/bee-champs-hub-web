/**
 * Sdilene TaggedError tridy pro API
 */
import { Data } from "effect"

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly cause: unknown
}> {}

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message: string
}> {}

export class ServiceUnavailableError extends Data.TaggedError("ServiceUnavailableError")<{
  readonly message: string
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string
  readonly detail?: string
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly entity: string
  readonly id: number | string
}> {}

export class CloudflareApiError extends Data.TaggedError("CloudflareApiError")<{
  readonly message: string
  readonly status?: number
}> {}
