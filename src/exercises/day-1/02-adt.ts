/**
 * Theory:
 *
 * Intro to algebraic data types & domain specific languages and their place in functional programming in general.
 *
 * In this module we introduce the basic concepts of domain specific languages and we look into practical ways of building DSLs for
 * your day-to-day problems.
 */

/**
 * Segment:
 *
 * ADTs
 */

/**
 * Exercise:
 *
 * Costruct the Boolean ADT and 3 functions: equals, invert, render
 */
export class True {
  readonly _tag = "True"
}

export class False {
  readonly _tag = "False"
}

export type BooleanADT = True | False

export declare const trueValue: BooleanADT

export declare const falseValue: BooleanADT

/**
 * Exercise:
 *
 * Build an adt MathExpr with members:
 * - Value (contains a numeric value)
 * - Add (describe a sum operation of 2 expressions)
 * - Sub (describe a subtraction operation of 2 expressions)
 * - Mul (describe a multiplication operation of 2 expressions)
 * - Div (describe a division operation of 2 expressions)
 */
export type MathExpr = never

/**
 * Exercise:
 *
 * Create constructors for all the members in MathExpr (pipeable)
 */

/**
 * Exercise:
 *
 * Create a small program using the MathExpr constructors
 */
export declare const program: MathExpr

/**
 * Exercise:
 *
 * Implement the function evaluate
 */
export declare function evaluate(expr: MathExpr): number

/**
 * Exercise:
 *
 * Write tests that assert correct behaviour of the evaluate function
 */
