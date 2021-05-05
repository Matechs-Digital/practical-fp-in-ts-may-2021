/**
 * Graduation:
 *
 * Putting together all the context so far we will build a minimal implementation of Schema.
 *
 * Schema is a module to describe data-types that enable derivation of Parser, Guard and potentially other utilities.
 */

import * as E from "@effect-ts/core/Either"
import { flow, identity, pipe } from "@effect-ts/system/Function"
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
export type Schema<I, A> =
  | SchemaString<I, A>
  | SchemaNumber<I, A>
  | SchemaUnknown<I, A>
  | SchemaCompose<I, A>
  | SchemaNumberString<I, A>

abstract class SchemaSyntax<I, A> {
  readonly [">>>"] = <B>(that: Schema<A, B>): Schema<I, B> =>
    // @ts-expect-error
    compose(that)(this)
}

export class SchemaString<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaString"
  constructor(readonly _A: (_: string) => A, readonly _I: (_: I) => unknown) {
    super()
  }
}

export const string: Schema<unknown, string> = new SchemaString(identity, identity)

export class SchemaNumber<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaNumber"
  constructor(readonly _A: (_: number) => A, readonly _I: (_: I) => unknown) {
    super()
  }
}

export const number: Schema<unknown, number> = new SchemaNumber(identity, identity)

export class SchemaUnknown<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaUnknown"
  constructor(readonly _A: (_: unknown) => A, readonly _I: (_: I) => unknown) {
    super()
  }
}

export const unknown: Schema<unknown, unknown> = new SchemaUnknown(identity, identity)

export class SchemaCompose<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaCompose"
  constructor(
    readonly use: <X>(go: <T>(self: Schema<I, T>, that: Schema<T, A>) => X) => X
  ) {
    super()
  }
}

export function compose<A, B>(that: Schema<A, B>) {
  return <I>(self: Schema<I, A>): Schema<I, B> =>
    new SchemaCompose((go) => go(self, that))
}

export class SchemaNumberString<I, A> extends SchemaSyntax<I, A> {
  readonly _tag = "SchemaNumberString"
  constructor(readonly _A: (_: number) => A, readonly _I: (_: I) => string) {
    super()
  }
}

export const stringNumber: Schema<string, number> = new SchemaNumberString(
  identity,
  identity
)

export const unknownStringNumber = string[">>>"](stringNumber)

/**
 * Exercise:
 *
 * implement the parse function that derive a Parser from a schema
 */
export interface Parser<I, A> {
  (u: I): E.Either<string, A>
}

export function parse<I, A>(self: Schema<I, A>): Parser<I, A> {
  switch (self._tag) {
    case "SchemaNumber": {
      return (u: I) =>
        typeof u === "number"
          ? E.right(self._A(u))
          : E.left(`was expecting a number but got ${JSON.stringify(u)}`)
    }
    case "SchemaString": {
      return (u: I) =>
        typeof u === "string"
          ? E.right(self._A(u))
          : E.left(`was expecting a string but got ${JSON.stringify(u)}`)
    }
    case "SchemaNumberString": {
      return (u: I) => {
        const i = self._I(u)
        const n = Number.parseFloat(i)
        if (Number.isNaN(n)) {
          return E.left(`was expecting a number encoded as a string got: ${i}`)
        }
        return E.right(self._A(n))
      }
    }
    case "SchemaUnknown": {
      return (u: I) => E.right(self._A(u))
    }
    case "SchemaCompose": {
      return self.use((self, that) => flow(parse(self), E.chain(parse(that))))
    }
  }
}

/**
 * Exercise:
 *
 * implement the guard function that derive a Guard from a schema
 */
export interface Guard<A> {
  (u: unknown): u is A
}

export function guard<I, A>(self: Schema<I, A>): Guard<A> {
  return pipe(
    self,
    matchTag({
      SchemaNumber: () => (_: unknown): _ is A =>
        typeof _ === "number" ? true : false,
      SchemaNumberString: () => (_: unknown): _ is A =>
        typeof _ === "number" ? true : false,
      SchemaString: () => (_: unknown): _ is A =>
        typeof _ === "string" ? true : false,
      SchemaUnknown: () => (_: unknown): _ is A => true,
      SchemaCompose: ({ use }) => use((_, that) => guard(that))
    })
  )
}

// RECORD

/**
 * Exercise:
 *
 * We would like to compose parsers, namely we would like Schema<A> to become
 * Schema<I, A> where I represent the row input of the parser ad A represents
 * the parsed model.
 *
 * First extend Schema to become Schema<I, A> then create a new primitive
 * SchemaCompose<I, A> that composes Schema<I, T> with Schema<T, A> to represent the
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
