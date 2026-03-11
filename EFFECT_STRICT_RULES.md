# Effect TS - Pravidla Prisneho Vyvoje (2026)

> **Verze**: Unor 2026 (Effect v3.x)
> **Ucel**: Definitivni checklist a pravidla pro psani spravneho, prisneho Effect TypeScript kodu

---

## Tri Zakladni Principy (NIKDY NEPORUSUJ)

### 1. **Totalni Typova Bezpecnost**
- ZAKAZANO: `any`, nekontrolovane `unknown`, `null`, `undefined` v domenovem kodu
- POVINNE: Veskera absence hodnoty = `Option<T>`

### 2. **Chyby jako Hodnoty**
- ZAKAZANO: `throw new Error(...)` v domenove logice
- POVINNE: `Data.TaggedError` pro vsechny domenove chyby
- Pravidlo: Vyjimky = pouze defekty/bugy, ne business logika

### 3. **Rizene Vedlejsi Efekty**
- ZAKAZANO: Vedlejsi efekty mimo Effect wrapper (prime I/O, mutace, random)
- POVINNE: Vse v `Effect.gen`, spusteni pouze pres `Effect.run*`

---

## DATOVE MODELOVANI

### SPRAVNE: Schema.Class
```typescript
class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
  email: Schema.String.pipe(Schema.email),
  isActive: Schema.Boolean
}) {}
```

### NESPRAVNE: Schema.Struct
```typescript
// Zastarale, netypovane, loose
const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})
type User = Schema.Schema.Type<typeof UserSchema>
```

---

## TAGGED STRUKTURY (Unie/Varianty)

### SPRAVNE: TaggedStruct
```typescript
const Circle = Schema.TaggedStruct("Circle", {
  radius: Schema.Number
})
const Square = Schema.TaggedStruct("Square", {
  sideLength: Schema.Number
})
const Shape = Schema.Union(Circle, Square)
```

---

## RIZENI TOKU

### SPRAVNE: Effect.gen
```typescript
const program = Effect.gen(function* () {
  const user = yield* getUser(id)
  const validation = yield* validate(user)
  if (!validation.isValid) {
    return yield* new ValidationError()
  }
  return yield* save(user)
})
```

### NESPRAVNE: Ruzne antipatterns
```typescript
// Chybejici yield*
const user = getUser(id)  // Vraci Effect, ne User!
// yield bez hvezdicky
const user = yield getUser(id)  // Nefunguje!
// async/await michani
const user = await getUser(id)  // Ztracime typovani chyb!
```

---

## SPRAVA CHYB

### SPRAVNE: TaggedError
```typescript
class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  readonly userId: number
}> {}

// Pouziti
Effect.gen(function* () {
  return yield* new UserNotFoundError({ userId: 123 })
})

// Zpracovani
program.pipe(
  Effect.catchTag("UserNotFoundError", (err) =>
    Effect.logWarning(`User ${err.userId} not found`)
  )
)
```

---

## PATTERN MATCHING

### SPRAVNE: Match.exhaustive
```typescript
const result = Match.value(input).pipe(
  Match.when({ status: 200 }, (res) => res.data),
  Match.when({ status: 404 }, () => "Not Found"),
  Match.when({ status: 500 }, () => "Server Error"),
  Match.exhaustive  // POVINNE!
)
```

---

## OPTION (Null Safety)

### SPRAVNE: Option
```typescript
const someValue = Option.some(42)
const noValue = Option.none()
const fromNullable = Option.fromNullable(maybeNull)
const doubled = Option.map(value, x => x * 2)
const result = Option.getOrElse(value, () => 0)
```

---

## ARCHITEKTURA (Context & Layers)

### SPRAVNE: Dependency Injection
```typescript
interface UsersService {
  readonly getUser: (id: number) => Effect.Effect<User, UserNotFoundError>
}
const UsersService = Context.GenericTag<UsersService>("UsersService")

const program = Effect.gen(function* () {
  const usersService = yield* UsersService
  const user = yield* usersService.getUser(123)
  return user
})

const UsersServiceLive = Layer.succeed(UsersService, {
  getUser: (id) => Effect.gen(function* () {
    // implementace
  })
})
```

---

## SOUBEZNOST

### SPRAVNE: Effect primitiva
```typescript
Effect.forEach(items, processItem, { concurrency: 5 })
Effect.all(effects, { concurrency: "unbounded" })
Effect.race(effect1, effect2)
Effect.cached(expensiveComputation)
```

---

## PIPE — DVE KLICOVA PRAVIDLA

### Pravidlo 1: `effect/no-method-pipe` — zadne `.pipe()` na instancich
```typescript
// ZAKAZANO: method .pipe()
handler(c).pipe(Effect.map(...))
// SPRAVNE: standalone pipe()
pipe(effect, Effect.map(...))
```

### Pravidlo 2: `effect/no-pipe-first-arg-call` — prvni arg nesmi byt volani funkce
```typescript
// ZAKAZANO: pipe(fn(x), ...)
pipe(handler(c), Effect.map(...))
// SPRAVNE: extrahuj do promenne
const effect = handler(c)
pipe(effect, Effect.map(...))
```

---

## MUTABLE STATE (MutableRef)

```typescript
import { MutableRef } from "effect"
const countersRef = MutableRef.make<ReadonlyMap<string, number>>(new Map())
MutableRef.get(countersRef)
MutableRef.set(countersRef, new Map([...counters, ["key", 42]]))
MutableRef.update(countersRef, (m) => new Map([...m, ["key", 42]]))
```

---

## WEBOVE API & RUNTIME (Cloudflare/Hono)

### SPRAVNE: ManagedRuntime Pattern
```typescript
import { Effect, Layer, ManagedRuntime } from "effect"
import type { Context } from "hono"

export const makeHonoRuntime = <R>(
  layerBuilder: (env: Env) => Layer.Layer<R, never, never>
) => (
  handler: (c: Context<{ readonly Bindings: Env }>) => Effect.Effect<Response, never, R>
) => (c: Context<{ readonly Bindings: Env }>): Promise<Response> =>
  ManagedRuntime.make(layerBuilder(c.env)).runPromise(
    Effect.catchAllDefect(handler(c), () =>
      Effect.succeed(new Response("Internal Server Error", { status: 500 }))
    )
  )

const withCore = makeHonoRuntime((env) =>
  Layer.merge(AgentRepoLive(env), TransactionRepoLive(env))
)

app.get("/agents", withCore((c) =>
  Effect.gen(function*() {
    const repo = yield* AgentRepository
    return yield* repo.findAll()
  })
))
```

---

## QUICK REFERENCE

| Potrebuji... | Pouzij | Nepouzivej |
|--------------|--------|------------|
| Definovat data | `Schema.Class<T>` | `interface`, `Schema.Struct` |
| Unie/varianty | `Schema.TaggedStruct` | Manualni `_tag` |
| Control flow | `Effect.gen + yield*` | `async/await`, `pipe` chains |
| Chyba | `Data.TaggedError` | `throw`, `Error("string")` |
| Nullable | `Option<T>` | `null`, `undefined`, `?:` |
| Pattern match | `Match.exhaustive` | `switch`, `if/else` |
| Sluzby | `Context.Tag` | Globalni instance |
| Soubeznost | `Effect.forEach` | `Promise.all` |
| Mutable state | `MutableRef` | `Map.set()`, `Array.push()` |
| App boundary | `ManagedRuntime.make(layer).runPromise(...)` | `Effect.runPromise`, `async/await` |
| Method ref | `.bind(this)` | `() => obj.method()` (eta-expansion) |

---

## Zlata Pravidla

1. Kdyz vidis `any` nebo `throw` = RED FLAG
2. Kdyz vidis `null` nebo `undefined` v domene = RED FLAG
3. Kdyz vidis `async/await` s Effect = RED FLAG
4. Kdyz chybi `yield*` = RED FLAG
5. Kdyz neni `Match.exhaustive` = RED FLAG
6. Kdyz vidis `Map.set()`, `Array.push()` = RED FLAG (pouzij `MutableRef`)
7. Kdyz vidis `Effect.runPromise` = RED FLAG (pouzij `ManagedRuntime`)
8. Kdyz vidis `eslint-disable` = RED FLAG (vzdy existuje spravne reseni)
