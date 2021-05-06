import * as E from "@effect-ts/core/Either"
import { hole, identity } from "@effect-ts/core/Function"

/**
 * Graduation:
 *
 * we want to build a Domain Specific Language to build generic programs,
 * generic programs have 3 main components that we need to consider:
 *
 * 1) A program can succeed in execution and provide a result
 * 2) A program may fail in execution raising a specific error
 * 3) A program may need dependencies to run
 *
 * while doing the exercises use the encoding of GADTs that supports existetial types.
 */

/**
 * Exercise:
 *
 * Define a GADT named IO that covers the base cases for 1, 2, 3.
 *
 * The GADT will initially have primitives:
 *
 * - Succeed => represents success
 * - Fail => represents failure
 * - Access => represents evironment access
 */
export type IO<R, E, A> =
  | Succeed<R, E, A>
  | Fail<R, E, A>
  | Access<R, E, A>
  | Chain<R, E, A>

/**
 * Write tests to assert that everythig works as expected while doing the exercises.
 */

/**
 * Write a recursive interpreter for IO
 */
export function run<R>(r: R): <E, A>(self: IO<R, E, A>) => E.Either<E, A> {
  return (self) => {
    switch (self._tag) {
      case "Succeed": {
        return E.right(self.value)
      }
      case "Fail": {
        return E.left(self.error)
      }
      case "Access": {
        return E.right(self.env(r))
      }
      case "Chain": {
        return self.use((fa, afb) => {
          const result = run(r)(fa)
          if (E.isLeft(result)) {
            return result
          }
          return run(r)(afb(result.right))
        })
      }
      default: {
        return hole()
      }
    }
  }
}

/**
 * Exercise:
 *
 * - Never fail (E => never)
 * - Doesn't require env (R => unknown)
 */
export class Succeed<R, E, A> {
  readonly _tag = "Succeed"

  constructor(
    readonly value: A,
    readonly _E: (_: never) => E,
    readonly _R: (_: R) => unknown
  ) {}
}

/**
 * Exercise:
 *
 * An effect that always succeeds with a value A
 */
export function succeed<A>(value: A): IO<unknown, never, A> {
  return new Succeed(value, identity, identity)
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
    readonly error: E,
    readonly _A: (_: never) => A,
    readonly _R: (_: R) => unknown
  ) {}
}

/**
 * Exercise:
 *
 * An effect that always fail with an error E
 */
export function fail<E>(error: E): IO<unknown, E, never> {
  return new Fail(error, identity, identity)
}

/**
 * Exercise:
 *
 * - Never fail (E => never)
 * - Requires R to produce A
 */
export class Access<R, E, A> {
  readonly _tag = "Access"
  constructor(readonly env: (_: R) => A, readonly _E: (_: never) => E) {}
}

/**
 * Exercise:
 *
 * An effect that uses f to access the environment in order to produce a value A
 */
export function access<R, A>(accessFn: (r: R) => A): IO<R, never, A> {
  return new Access(accessFn, identity)
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
    readonly use: <X>(f: <T>(self: IO<R, E, T>, f: (a: T) => IO<R, E, A>) => X) => X
  ) {}
}

// RECORD

/**
 * Exercise:
 *
 * Produces an effect that describe the operation of running `self`, taking it's result and
 * feed it into `chainFn` to produce a new operation
 */
export function chain<A, R1, E1, A1>(
  chainFn: (a: A) => IO<R1, E1, A1>
): <R, E>(self: IO<R, E, A>) => IO<R & R1, E | E1, A1> {
  return (self) => new Chain((f) => f(self, chainFn))
}

/**
 * First small program, should be typed as:
 *
 * IO<{
 *     n: number;
 * }, "positive", `got ${number}`>
 */
//export const simpleProgram = pipe(
//  access(({ n }: { n: number }) => n),
//  chain((n) => (n > 0 ? fail("positive" as const) : succeed(`got ${n}` as const)))
//)

/**
 * Implement the map function in terms of chain & succeed
 */
export function map<A, A1>(
  mapFn: (a: A) => A1
): <R, E>(self: IO<R, E, A>) => IO<R, E, A1> {
  return chain((a) => succeed(mapFn(a)))
}

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
}

/**
 * Exercise:
 *
 * Produces an effect that describe the operation of running `self`, taking it's error in case
 * of failures and feed it into `recoverFn` to produce a new operation
 */
export declare function catchAll<E, R1, E1, A1>(
  recoverFn: (e: E) => IO<R1, E1, A1>
): <R, A>(self: IO<R, E, A>) => IO<R & R1, E1, A | A1>

/**
 * Exercise:
 *
 * Runs `acquire`, then runs `use`, and feeds the result (both error or success)
 * into `finalize` returning the original result.
 *
 * Note: the current primitive set struggle to represent this, we need a "better" primitive.
 *       we introduce Fold as a primitive with onError and onSuccess that packs in one step
 *       chain & catchAll
 */
export declare function bracket<A, RU, EU, AU, RF, EF, AF>(
  use: (a: A) => IO<RU, EU, AU>,
  finalize: (a: A, exit: E.Either<EU, AU>) => IO<RF, EF, AF>
): <R, E>(self: IO<R, E, A>) => IO<R & RU & RF, E | EU | EF, AU>

/**
 * Exercise:
 *
 * We want to be able to catch errors in operations, and recover
 */
export class Fold<R, E, A> {
  readonly _tag = "Fold"
}

/**
 * Exercise:
 *
 * Folds both success and failures
 */
export declare function foldM<E, A, R1, E1, A1, R2, E2, A2>(
  onError: (e: E) => IO<R2, E2, A2>,
  onSuccess: (a: A) => IO<R1, E1, A1>
): <R>(self: IO<R, E, A>) => IO<R & R1 & R2, E1 | E2, A1 | A2>

/**
 * Exercise:
 *
 * - Never fail (E => never)
 * - Requires R to produce A
 */
export class Provide<R, E, A> {
  readonly _tag = "Provide"
}

/**
 * Exercise:
 *
 * Provides part of the environment
 */
export declare function provideSome<R, R0>(
  provideFn: (r: R) => R0
): <E, A>(self: IO<R0, E, A>) => IO<R, E, A>

/**
 * Final (very hard):
 *
 * Describe how to implement recursive procedures in a stack safe manner
 */
