import * as E from "@effect-ts/core/Either"
import { Stack } from "@effect-ts/system/Fiber"
import { identity, pipe } from "@effect-ts/system/Function"

/**
 * Problem definition:
 *
 * we want to build a Domain Specific Language to build generic programs,
 * generic programs have 3 main components that we need to consider:
 *
 * 1) A program can succeed in execution and provide a result
 * 2) A program may fail in execution raising a specific error
 * 3) A program may need dependencies to run
 */

/**
 * Exercise:
 *
 * Define a GADT named IO that covers the base cases for 1, 2, 3.
 *
 * The GADT will initially have primitives:
 * - Succeed => represents success
 * - Fail => represents failure
 * - Access => represents evironment access
 */
export type IO<R, E, A> =
  | Succeed<R, E, A>
  | Fail<R, E, A>
  | Access<R, E, A>
  | Chain<R, E, A>
  | Catch<R, E, A>

/**
 * Exercise:
 *
 * - Never fail (E => never)
 * - Doesn't require env (R => unknown)
 */
export class Succeed<R, E, A> {
  readonly _tag = "Succeed"
  constructor(
    readonly use: <X>(
      f: (_: {
        readonly _R: (_: R) => unknown
        readonly _E: (_: never) => E

        readonly value: A
      }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * An effect that always succeeds with a value A
 */
export function succeed<A>(value: A): IO<unknown, never, A> {
  return new Succeed((f) =>
    f({
      _E: identity,
      _R: identity,
      value
    })
  )
}

/**
 * Exercise:
 *
 * - Never succeed (A => never)
 * - Doesn't require env (R => unknown)
 */
export class Fail<R, E, A> {
  readonly _tag = "Fail"

  constructor(
    readonly use: <X>(
      f: (_: {
        readonly _R: (_: R) => unknown
        readonly _A: (_: never) => A

        readonly error: E
      }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * An effect that always fail with an error E
 */
export function fail<E>(error: E): IO<unknown, E, never> {
  return new Fail((f) =>
    f({
      _A: identity,
      _R: identity,
      error
    })
  )
}

/**
 * Exercise:
 *
 * - Never fail (E => never)
 * - Requires R to produce A
 */
export class Access<R, E, A> {
  readonly _tag = "Access"

  constructor(
    readonly use: <X>(
      f: (_: {
        readonly _E: (_: never) => E

        readonly accessFn: (r: R) => A
      }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * An effect that uses f to access the environment in order to produce a value A
 */
export function access<R, A>(accessFn: (r: R) => A): IO<R, never, A> {
  return new Access((f) =>
    f({
      _E: identity,
      accessFn
    })
  )
}

/**
 * Check the variance of R and E
 */
export type XX =
  | IO<{ a: number }, { _tag: "A" }, "A">
  | IO<{ b: number }, { _tag: "B" }, "B">

export type ROf = [XX] extends [IO<infer R, any, any>] ? R : never // should be { a: number } & { b: number }
export type EOf = [XX] extends [IO<any, infer E, any>] ? E : never // should be { _tag: "A" } | { _tag: "B"}

/**
 * Exercise:
 *
 * We want to be able to execute sequences of operations, create a primitive for that
 */
export class Chain<R, E, A> {
  readonly _tag = "Chain"

  constructor(
    readonly use: <X>(
      f: <T>(_: { readonly fx: IO<R, E, T>; readonly xfa: (a: T) => IO<R, E, A> }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * Produces an effect that describe the operation of running `self`, taking it's result and
 * feed it into `chainFn` to produce a new operation
 */
export function chain<A, R1, E1, A1>(
  chainFn: (a: A) => IO<R1, E1, A1>
): <R, E>(self: IO<R, E, A>) => IO<R & R1, E | E1, A1> {
  return (self) =>
    new Chain((f) =>
      f({
        fx: self,
        xfa: chainFn
      })
    )
}

/**
 * First small program, should be typed as:
 *
 * IO<{
 *     n: number;
 * }, "positive", `got ${number}`>
 */
export const simpleProgram = pipe(
  access(({ n }: { n: number }) => n),
  chain((n) => (n > 0 ? fail("positive" as const) : succeed(`got ${n}` as const)))
)

/**
 * Implement the map function in terms of chain & succeed
 */
export declare function map<A, A1>(
  chainFn: (a: A) => A1
): <R, E>(self: IO<R, E, A>) => IO<R, E, A1>

/**
 * Implement the costant `unit`
 */
export declare const unit: IO<unknown, never, void>

/**
 * Implement the constructor `succeedWith`
 */
export declare function succeedWith<A>(f: () => A): IO<unknown, never, A>

/**
 * Implement the constructor `failWith`
 */
export declare function failWith<E>(f: () => E): IO<unknown, E, never>

/**
 * Exercise:
 *
 * We want to be able to catch errors in operations, and recover
 */
export class Catch<R, E, A> {
  readonly _tag = "Catch"

  constructor(
    readonly use: <X>(
      f: <T>(_: { readonly fx: IO<R, T, A>; readonly xfe: (e: T) => IO<R, E, A> }) => X
    ) => X
  ) {}
}

/**
 * Exercise:
 *
 * Produces an effect that describe the operation of running `self`, taking it's error in case
 * of failures and feed it into `recoverFn` to produce a new operation
 */
export function catchAll<E, R1, E1, A1>(
  recoverFn: (e: E) => IO<R1, E1, A1>
): <R, A>(self: IO<R, E, A>) => IO<R & R1, E1, A | A1> {
  return (self) =>
    new Catch((f) =>
      f({
        fx: self,
        xfe: recoverFn
      })
    )
}

/**
 * Write a recursive interpreter for IO
 */
export function run<R>(r: R): <E, A>(self: IO<R, E, A>) => E.Either<E, A> {
  return (self) => {
    switch (self._tag) {
      case "Succeed": {
        return self.use(({ value }) => E.right(value))
      }
      case "Fail": {
        return self.use(({ error }) => E.left(error))
      }
      case "Access": {
        return self.use(({ accessFn }) => E.right(accessFn(r)))
      }
      case "Chain": {
        return self.use(({ fx, xfa }) => {
          const resA = run(r)(fx)
          if (resA._tag === "Left") {
            return E.left(resA.left)
          }
          return run(r)(xfa(resA.right))
        })
      }
      case "Catch": {
        return self.use(({ fx, xfe }) => {
          const resA = run(r)(fx)
          if (resA._tag === "Left") {
            return run(r)(xfe(resA.left))
          }
          return E.right(resA.right)
        })
      }
    }
  }
}

/**
 * Write tests to assert that everythig up to now works as expected
 */

class FrameChain {
  readonly _tag = "FrameChain"
  constructor(readonly f: (a: any) => IO<any, any, any>) {}
}

class FrameCatch {
  readonly _tag = "FrameCatch"
  constructor(readonly f: (e: any) => IO<any, any, any>) {}
}

type RunSafeStack = Stack<FrameChain | FrameCatch> | undefined

/**
 * Example
 *
 * Stack safe interpreter
 */
export function runSafe<R>(r: R): <E, A>(self: IO<R, E, A>) => E.Either<E, A> {
  return (self) => {
    let stack = undefined as RunSafeStack

    let result = undefined
    let isError = false

    // eslint-disable-next-line no-constant-condition
    recursing: while (1) {
      // eslint-disable-next-line no-constant-condition
      pushing: while (1) {
        switch (self._tag) {
          case "Succeed": {
            result = self.use(({ value }) => value)
            isError = false
            break pushing
          }
          case "Fail": {
            result = self.use(({ error }) => error)
            isError = true
            break pushing
          }
          case "Access": {
            result = self.use(({ accessFn }) => accessFn(r))
            isError = false
            break pushing
          }
          case "Chain": {
            self.use(({ fx, xfa }) => {
              stack = new Stack(new FrameChain(xfa), stack)
              // @ts-expect-error
              self = fx
            })
            continue pushing
          }
          case "Catch": {
            self.use(({ fx, xfe }) => {
              stack = new Stack(new FrameCatch(xfe), stack)
              // @ts-expect-error
              self = fx
            })
            continue pushing
          }
        }
      }
      // eslint-disable-next-line no-constant-condition
      popping: while (1) {
        if (stack) {
          const frame = stack.value
          stack = stack.previous
          switch (frame._tag) {
            case "FrameChain": {
              if (!isError) {
                self = frame.f(result)
                continue recursing
              } else {
                continue popping
              }
            }
            case "FrameCatch": {
              if (isError) {
                self = frame.f(result)
                continue recursing
              } else {
                continue popping
              }
            }
          }
        }
        break recursing
      }
    }

    return isError ? E.left(result as any) : E.right(result as any)
  }
}
