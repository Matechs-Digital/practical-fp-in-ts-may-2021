/**
 * Theory:
 *
 * Intro to generalized algebraic data types and their place in functional programming in general.
 *
 * In this module we introduce a generalization to algebraic data types required to deal with generic patameters.
 */

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
export type Expr<A> = {}

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
