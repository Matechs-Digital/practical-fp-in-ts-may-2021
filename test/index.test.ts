import { BooleanADT, EIO, Pipeable, SimpleIO } from "@app"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"

describe("BooleanADT", () => {
  it("Invert of True is False", () => {
    expect(BooleanADT.renderToString(BooleanADT.invert(BooleanADT.makeTrue()))).toEqual(
      "Boolean is False"
    )
  })
})

describe("Pipeable", () => {
  it("Pipe result should be 3", () => {
    expect(pipe(0, Pipeable.add(1), Pipeable.add(2), Pipeable.renderToString)).toEqual(
      "result is 3"
    )
  })
})

describe("SimpleIO", () => {
  it("Should use map and succeed", () => {
    expect(
      pipe(
        SimpleIO.succeed(0),
        SimpleIO.map(Pipeable.add(1)),
        SimpleIO.map(Pipeable.add(2)),
        SimpleIO.map(Pipeable.renderToString),
        SimpleIO.run
      )
    ).toEqual("result is 3")
  })
  it("Should use map and succeed (runSafe)", () => {
    expect(
      pipe(
        SimpleIO.succeed(0),
        SimpleIO.map(Pipeable.add(1)),
        SimpleIO.map(Pipeable.add(2)),
        SimpleIO.map(Pipeable.renderToString),
        SimpleIO.runSafe
      )
    ).toEqual("result is 3")
  })
  it("Should use map, chain and succeed", () => {
    const program = pipe(
      SimpleIO.succeed(0),
      SimpleIO.map(Pipeable.add(1)),
      SimpleIO.map(Pipeable.add(2)),
      SimpleIO.chain((n) => SimpleIO.succeed(Pipeable.renderToString(n)))
    )
    expect(pipe(program, SimpleIO.run)).toEqual("result is 3")
    expect(pipe(program, SimpleIO.runSafe)).toEqual("result is 3")
  })
  it("Should use map, chain, suspend and succeed", () => {
    const program = pipe(
      SimpleIO.suspend(() => SimpleIO.succeed(0)),
      SimpleIO.map(Pipeable.add(1)),
      SimpleIO.map(Pipeable.add(2)),
      SimpleIO.chain((n) => SimpleIO.succeed(Pipeable.renderToString(n)))
    )
    expect(pipe(program, SimpleIO.run)).toEqual("result is 3")
    expect(pipe(program, SimpleIO.runSafe)).toEqual("result is 3")
  })
  it("Should use map, chain, suspend, succeed and fail", () => {
    const program = pipe(
      EIO.suspend(() => EIO.succeed(0)),
      EIO.map(Pipeable.add(1)),
      EIO.map(Pipeable.add(2)),
      EIO.chain((n) => EIO.succeed(Pipeable.renderToString(n))),
      EIO.chain((s) => EIO.fail(`error: ${s}`))
    )
    expect(pipe(program, EIO.run)).toEqual(E.left("error: result is 3"))
    expect(pipe(program, EIO.runSafe)).toEqual(E.left("error: result is 3"))
  })
  it("Should use map, chain, suspend, succeed, fail and catchAll", () => {
    const program = pipe(
      EIO.suspend(() => EIO.succeed(0)),
      EIO.map(Pipeable.add(1)),
      EIO.map(Pipeable.add(2)),
      EIO.chain((n) => EIO.succeed(Pipeable.renderToString(n))),
      EIO.chain((s) => EIO.fail(`error: ${s}`)),
      EIO.catchAll((e) => EIO.succeed(e))
    )
    expect(pipe(program, EIO.run)).toEqual(E.right("error: result is 3"))
    expect(pipe(program, EIO.runSafe)).toEqual(E.right("error: result is 3"))
  })
})
