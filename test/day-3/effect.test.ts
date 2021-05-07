import * as App from "@app/exercises/day-3/01-effect"
import { pipe } from "@effect-ts/core"
import * as T from "@effect-ts/core/Effect"
import * as Cause from "@effect-ts/core/Effect/Cause"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as O from "@effect-ts/core/Option"

describe("Effect", () => {
  it("should succeed", async () => {
    const res = await T.runPromise(App.one)

    expect(res).toEqual(1)
  })

  it("fail", async () => {
    const res = await T.runPromiseExit(App.error)

    Ex.assertsFailure(res)

    expect(Ex.untraced(res)).toEqual(Ex.fail("error"))
  })

  it("die", async () => {
    const res = await T.runPromiseExit(App.die)

    Ex.assertsFailure(res)

    expect(Ex.untraced(res)).toEqual(Ex.die("error"))
  })

  it("should access", async () => {
    const env = pipe(App.read, T.provideAll({ input: "hey!" }))
    const res = await T.runPromise(env)
    expect(res).toEqual("hey!")
  })

  it("should succeedWith", async () => {
    const res = await T.runPromiseExit(T.succeedWith(() => 1))

    expect(res).toEqual(Ex.succeed(1))
  })

  it("should map", async () => {
    const res = await pipe(
      T.succeed(2),
      T.map((_) => _ * 2),
      T.runPromise
    )

    expect(res).toEqual(4)
  })

  it("chain", async () => {
    const res = await pipe(
      App.one,
      T.chain((n) => T.succeed(n + 1)),
      T.runPromise
    )
    expect(res).toEqual(2)
  })

  it("random program should succeed", async () => {
    const res = await pipe(
      App.randomGteHalf,
      T.provideAll<App.RandGen>({ rand: T.succeed(0.7) }),
      T.runPromiseExit
    )

    expect(res).toEqual(Ex.succeed(0.7))
  })

  it("random program should fail", async () => {
    const res = await pipe(
      App.randomGteHalf,
      T.provideAll<App.RandGen>({ rand: T.succeed(0.4) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail(new App.InvalidRandom({ number: 0.4 })))
  })

  it("randomGteHalf catchAll", async () => {
    const res = await pipe(
      App.randomGteHalfOr1,
      T.provideAll<App.RandGen>({ rand: T.succeed(0.3) }),
      T.runPromise
    )

    expect(res).toEqual(0.8)
  })

  it("T.catchAllCause", async () => {
    const res = await pipe(
      T.die("error"),
      T.catchAllCause((_) =>
        pipe(
          _,
          Cause.find(
            O.partial((miss) => (x): string => {
              if (Cause.equals(x, Cause.die("error"))) {
                return "ok"
              }
              return miss()
            })
          ),
          O.fold(
            () => T.halt(_),
            (_) => T.succeed(_)
          )
        )
      ),
      T.runPromiseExit
    )

    expect(res).toEqual(Ex.succeed("ok"))
  })
})
