import * as IO from "@app/exercises/day-1/06-io"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/system/Function"

describe("IO", () => {
  it("succeed", () => {
    const res = pipe(IO.succeed(1), IO.run({}))
    expect(res).toEqual(E.right(1))
  })
  it("chain operations", () => {
    const res = pipe(
      IO.access(({ x }: { x: number }) => x),
      IO.chain((n) =>
        pipe(
          IO.access(({ y }: { y: string }) => y),
          IO.chain((s) => IO.fail(`${s}${n}`))
        )
      ),
      IO.run({
        x: 1,
        y: "error: "
      })
    )
    expect(res).toEqual(E.left("error: 1"))
  })
})
