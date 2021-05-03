import * as IO from "@app/IO"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/system/Function"

describe("IO", () => {
  it("simpleProgram should fail on positive input", () => {
    expect(pipe(IO.simpleProgram, IO.run({ n: 1 }))).equals(E.left("positive"))
    expect(pipe(IO.simpleProgram, IO.runSafe({ n: 1 }))).equals(E.left("positive"))
  })
  it("simpleProgram should succees on negative input", () => {
    expect(pipe(IO.simpleProgram, IO.run({ n: -1 }))).equals(E.right("got -1"))
    expect(pipe(IO.simpleProgram, IO.runSafe({ n: -1 }))).equals(E.right("got -1"))
  })
  it("simpleProgram should catch errors", () => {
    expect(
      pipe(
        IO.simpleProgram,
        IO.catchAll((_) => IO.succeed(_)),
        IO.run({ n: 1 })
      )
    ).equals(E.right("positive"))
    expect(
      pipe(
        IO.simpleProgram,
        IO.catchAll((_) => IO.succeed(_)),
        IO.runSafe({ n: 1 })
      )
    ).equals(E.right("positive"))
  })
})
