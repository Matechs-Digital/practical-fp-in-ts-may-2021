import * as S from "@app/exercises/day-1/05-schema"
import * as E from "@effect-ts/core/Either"

describe("Schema", () => {
  it("parse number", () => {
    expect(S.parse(S.number)("")).toEqual(E.left('was expecting a number but got ""'))
    expect(S.parse(S.number)(1)).toEqual(E.right(1))
  })
  it("parse number from string", () => {
    expect(S.parse(S.unknownStringNumber)(1)).toEqual(
      E.left("was expecting a string but got 1")
    )
    expect(S.parse(S.unknownStringNumber)("a")).toEqual(
      E.left("was expecting a number encoded as a string got: a")
    )
    expect(S.parse(S.unknownStringNumber)("1")).toEqual(E.right(1))
  })
  it.todo("parse string")
  it.todo("parse unknown")

  it.todo("guards number")
  it("guards string", () => {
    expect(S.guard(S.string)("test")).toBe(true)
    expect(S.guard(S.string)(1)).toBe(false)
  })
  it.todo("guards unknown")
})
