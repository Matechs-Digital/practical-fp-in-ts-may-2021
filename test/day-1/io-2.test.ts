import * as IO from "@app/exercises/day-1/06-io"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/system/Function"

describe("IO", () => {
  it("succeed", () => {
    const res = pipe(IO.succeed(1), IO.run({}))
    expect(res).toEqual(E.right(1))
  })
})
