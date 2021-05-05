import * as ADT from "@app/exercises/day-1/02-adt"
import { pipe } from "@effect-ts/core/Function"

describe("ADT", () => {
  it("equals", () => {
    expect(pipe(ADT.trueValue, ADT.equals(ADT.trueValue))).toBe(true)
  })

  it("equals not", () => {
    expect(pipe(ADT.trueValue, ADT.equals(ADT.falseValue))).not.toBe(true)
  })

  it("invert", () => {
    expect(pipe(ADT.trueValue, ADT.invert)).toEqual(ADT.falseValue)
  })

  it("render", () => {
    expect(pipe(ADT.trueValue, ADT.render)).toBe("True")
  })

  it("should return 0.4", () => {
    expect(ADT.evaluate(ADT.program)).toBe(0.4)
  })
})
