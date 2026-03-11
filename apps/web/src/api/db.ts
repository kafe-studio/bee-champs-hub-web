/**
 * DbRepository — sdileny pristup k Drizzle DB pres Effect Layer
 */
import { Context, Effect, Layer } from "effect"
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"
import { DatabaseError } from "./errors"

export interface DbRepository {
  readonly drizzle: DrizzleD1Database
  readonly query: <T>(fn: (db: DrizzleD1Database) => Promise<T>) => Effect.Effect<T, DatabaseError>
}

export const DbRepository = Context.GenericTag<DbRepository>("DbRepository")

export const DbRepositoryLive = (d1: D1Database): Layer.Layer<DbRepository> => {
  const db = drizzle(d1)
  return Layer.succeed(DbRepository, {
    drizzle: db,
    query: <T>(fn: (db: DrizzleD1Database) => Promise<T>) =>
      Effect.tryPromise({
        try: () => fn(db),
        catch: (cause) => {
          console.error("[DbRepository] Query error:", cause)
          return new DatabaseError({ cause })
        },
      }),
  })
}
