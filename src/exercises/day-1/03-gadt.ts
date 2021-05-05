/**
 * Theory:
 *
 * Intro to generalized algebraic data types and their place in functional programming in general.
 *
 * In this module we introduce a generalization to algebraic data types required to deal with generic patameters.
 */

import { identity, pipe } from "@effect-ts/core/Function"
import { matchTag } from "@effect-ts/core/Utils"

/**
 * Segment:
 *
 * GADTs
 */

/**
 * Exercise:
 *
 * We would like to port over the previous module Expr<number> to a more general Expr<A> having the Math functions
 * restricted to Expr<number>
 */
export type Expr<A> =
  | NumericValue<A>
  | StringValue<A>
  | Add<A>
  | Sub<A>
  | Mul<A>
  | Div<A>

export class StringValue<A> {
  readonly _tag = "StringValue"
  constructor(readonly value: string, readonly _A: (a: string) => A) {}
}

export class NumericValue<A> {
  readonly _tag = "NumericValue"
  constructor(readonly value: number, readonly _A: (a: number) => A) {}
}

export class Add<A> {
  readonly _tag = "Add"
  constructor(
    readonly op1: Expr<number>,
    readonly op2: Expr<number>,
    readonly _A: (a: number) => A
  ) {}
}

export class Sub<A> {
  readonly _tag = "Sub"
  constructor(
    readonly op1: Expr<number>,
    readonly op2: Expr<number>,
    readonly _A: (a: number) => A
  ) {}
}

export class Mul<A> {
  readonly _tag = "Mul"
  constructor(
    readonly op1: Expr<number>,
    readonly op2: Expr<number>,
    readonly _A: (a: number) => A
  ) {}
}

export class Div<A> {
  readonly _tag = "Div"
  constructor(
    readonly op1: Expr<number>,
    readonly op2: Expr<number>,
    readonly _A: (a: number) => A
  ) {}
}

export function numericValue(value: number): Expr<number> {
  return new NumericValue(value, identity)
}

export function stringValue(value: string): Expr<string> {
  return new StringValue(value, identity)
}

export function add(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> => new Add(left, right, identity)
}

export function sub(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> => new Sub(left, right, identity)
}

export function mul(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> => new Mul(left, right, identity)
}

export function div(right: Expr<number>) {
  return (left: Expr<number>): Expr<number> => new Div(left, right, identity)
}

export const program = pipe(
  numericValue(2),
  add(numericValue(3)),
  sub(numericValue(4)),
  mul(numericValue(2)),
  div(numericValue(5))
)

export const program2 = pipe(stringValue("2"))

/**
 * Exercise:
 *
 * Implement the evaluate function
 */
export function evaluate<A>(params: Expr<A>): A {
  return pipe(
    params,
    matchTag({
      Add: ({ _A, op1, op2 }) => _A(evaluate(op1) + evaluate(op2)),
      Sub: ({ _A, op1, op2 }) => _A(evaluate(op1) - evaluate(op2)),
      Div: ({ _A, op1, op2 }) => _A(evaluate(op1) / evaluate(op2)),
      Mul: ({ _A, op1, op2 }) => _A(evaluate(op1) * evaluate(op2)),
      NumericValue: ({ _A, value }) => _A(value),
      StringValue: ({ _A, value }) => _A(value)
    })
  )
}

/**
 * Exercise:
 *
 * Extend the Expr GADT to support:
 * 1) StringValue (Expr<string>)
 * 2) Concat (that concatenates 2 Expr<string>)
 * 3) Stringify (that converts Expr<number> into Expr<string>)
 *
 * Updating the interpreter as you go through.
 */

/**
 * Exercise:
 *
 * Write a program that uses the new primitives and test its behaviour
 */
