/**
 * Graduation:
 *
 * Putting together all the context so far we will build a minimal implementation of Schema.
 *
 * Schema is a module to describe data-types that enable derivation of Parser, Guard and potentially other utilities.
 */

import * as E from "@effect-ts/core/Either"
import { identity, pipe } from "@effect-ts/system/Function"
import { matchTag } from "@effect-ts/system/Utils"

/**
 * Write tests while implementing
 */

/**
 * Exercise:
 *
 * Let's start by implementing the following primitives that represent:
 *
 * 1) string values
 * 2) number values
 * 3) uknown values
 */
export type Schema<A> = SchemaString<A> | SchemaNumber<A> | SchemaUnknown<A>

export class SchemaString<A> {
  readonly _tag = "SchemaString"
  constructor(readonly _A: (_: string) => A) {}
}

export const string: Schema<string> = new SchemaString(identity)

export class SchemaNumber<A> {
  readonly _tag = "SchemaNumber"
  constructor(readonly _A: (_: number) => A) {}
}

export const number: Schema<number> = new SchemaNumber(identity)

export class SchemaUnknown<A> {
  readonly _tag = "SchemaUnknown"
  constructor(readonly _A: (_: unknown) => A) {}
}

export const unknown: Schema<unknown> = new SchemaUnknown(identity)

/**
 * Exercise:
 *
 * implement the parse function that derive a Parser from a schema
 */
export interface Parser<A> {
  (u: unknown): E.Either<string, A>
}

export function parse<A>(self: Schema<A>): Parser<A> {
  return pipe(
    self,
    matchTag({
      SchemaNumber: ({ _A }) => (u: unknown) =>
        typeof u === "number"
          ? E.right(_A(u))
          : E.left(`was expecting a number but got ${JSON.stringify(u)}`),
      SchemaString: ({ _A }) => (u: unknown) =>
        typeof u === "string"
          ? E.right(_A(u))
          : E.left(`was expecting a string but got ${JSON.stringify(u)}`),
      SchemaUnknown: ({ _A }) => (u: unknown) => E.right(_A(u))
    })
  )
}

/**
 * Exercise:
 *
 * implement the guard function that derive a Guard from a schema
 */
export interface Guard<A> {
  (u: unknown): u is A
}

export function guard<A>(self: Schema<A>): Guard<A> {
  return pipe(
    self,
    matchTag({
      SchemaNumber: () => (_: unknown): _ is A =>
        typeof _ === "number" ? true : false,
      SchemaString: () => (_: unknown): _ is A =>
        typeof _ === "string" ? true : false,
      SchemaUnknown: () => (_: unknown): _ is A => true
    })
  )
}

/**
 * Exercise:
 *
 * We would like to compose parsers, namely we would like Schema<A> to become
 * Schema<I, A> where I represent the row input of the parser ad A represents
 * the parsed model.
 *
 * First extend Schema to become Schema<I, A> then create a new primitive
 * SchemaCompose<I, A> that composes Parser<I, T> with Parser<T, A> to represent the
 * activity of first parsing I to T then parsing T to A
 */

/**
 * Exercise:
 *
 * Add a new primitive SchemaStringNumber that represent a Number encoded as a string
 */

/**
 * Exercise:
 *
 * Use the new primitive with compose to create a Schema<unknonw, number> that
 * is encoded as a string
 */

/**
 * Exercise:
 *
 * Add new primitives SchemaArray and SchemaUnknownArray
 */

/**
 * Exercise:
 *
 * Add:
 *
 * 1) new primitives SchemaRecord and SchemaObject
 *
 * 2) a constructor fuction that takes a record of schemas
 *    { a: Schema<unknown, A>, b: Schema<unknown, B>, c: Schema<unknown, C> }
 *    and constructs Schema<{}, { a: A, b: B, c: C }>
 *
 * 3) a schema object Schema<unknown, {}>
 *
 * 4) a constructor that composes 2 & 3
 */

/**
 * Exercise:
 *
 * Add a method [">>>"] in schema to perform composition like: object[">>>"](struct({a: ...}))
 */
