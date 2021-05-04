/**
 * Theory:
 *
 * Intro to generalized algebraic data types and their place in functional programming in general.
 *
 * In this module we introduce a generalization to algebraic data types required to deal with generic patameters.
 */

import { identity } from "@effect-ts/system/Function"

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
export type Expr<A> = NumericValue<A> | Add<A> | Sub<A> | Mul<A> | Div<A>

export class NumericValue<A> {
  readonly _tag = "NumericValue"
  constructor(readonly value: number, readonly _A: (_: number) => A) {}
}

export class Add<A> {
  readonly _tag = "Add"
  constructor(
    readonly x: Expr<number>,
    readonly y: Expr<number>,
    readonly _A: (_: number) => A
  ) {}
}

export class Sub<A> {
  readonly _tag = "Sub"
  constructor(
    readonly x: Expr<number>,
    readonly y: Expr<number>,
    readonly _A: (_: number) => A
  ) {}
}

export class Mul<A> {
  readonly _tag = "Mul"
  constructor(
    readonly x: Expr<number>,
    readonly y: Expr<number>,
    readonly _A: (_: number) => A
  ) {}
}

export class Div<A> {
  readonly _tag = "Div"
  constructor(
    readonly x: Expr<number>,
    readonly y: Expr<number>,
    readonly _A: (_: number) => A
  ) {}
}

export function value(value: number): Expr<number> {
  return new NumericValue(value, identity)
}

export function add(y: Expr<number>): (x: Expr<number>) => Expr<number> {
  return (x) => new Add(x, y, identity)
}

export function sub(y: Expr<number>): (x: Expr<number>) => Expr<number> {
  return (x) => new Sub(x, y, identity)
}

export function mul(y: Expr<number>): (x: Expr<number>) => Expr<number> {
  return (x) => new Mul(x, y, identity)
}

export function div(y: Expr<number>): (x: Expr<number>) => Expr<number> {
  return (x) => new Div(x, y, identity)
}

/**
 * Exercise:
 *
 * Implement the evaluate function
 */
export declare function evaluate<A>(params: Expr<A>): A

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
