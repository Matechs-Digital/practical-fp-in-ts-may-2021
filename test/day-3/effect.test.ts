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
  it("foldM success", async () => {
    const res = await pipe(
      T.succeed(1),
      T.foldM(
        (e) => T.fail(e),
        (v) => T.succeed(v)
      ),
      T.runPromise
    )

    expect(res).toEqual(1)
  })

  it("foldM failure", async () => {
    const res = await pipe(
      T.fail("error"),
      T.foldM(
        (e) => T.fail(e),
        (v) => T.succeed(v)
      ),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail("error"))
  })

  it("result", async () => {
    const res = await pipe(
      T.fail("error"),
      T.result,
      T.chain((_) => T.done(_)),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail("error"))
  })

  it("tapError", async () => {
    const f = jest.fn()
    const res = await pipe(
      App.randomGteHalf,
      T.tapError((e) =>
        T.succeedWith(() => {
          f(e)
        })
      ),
      T.provideAll<App.RandGen>({ rand: T.succeed(0.4) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail(new App.InvalidRandom({ number: 0.4 })))
    expect(f).toHaveBeenCalledTimes(1)
  })

  it("tapBoth fail", async () => {
    const onFail = jest.fn()
    const onSuccess = jest.fn()
    const res = await pipe(
      App.randomGteHalf,
      T.tapBoth(
        (e) =>
          T.succeedWith(() => {
            onFail(e)
          }),
        (n) =>
          T.succeedWith(() => {
            onSuccess(n)
            return n
          })
      ),
      T.provideAll<App.RandGen>({ rand: T.succeed(0.4) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail(new App.InvalidRandom({ number: 0.4 })))
    expect(onFail).toHaveBeenCalledTimes(1)
    expect(onSuccess).not.toBeCalled()
  })

  it("tapBoth succeed", async () => {
    const onFail = jest.fn()
    const onSuccess = jest.fn()
    const res = await pipe(
      App.randomGteHalf,
      T.provideAll<App.RandGen>({ rand: T.succeed(0.6) }),
      T.tapBoth(
        (e) =>
          T.succeedWith(() => {
            onFail(e)
          }),
        (n) =>
          T.succeedWith(() => {
            onSuccess(n)
            return n
          })
      ),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.succeed(0.6))
    expect(onFail).not.toBeCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it("catchTag", async () => {
    class TooBig {
      readonly _tag = "TooBig"
    }

    const res = await pipe(
      App.randomGteHalf,
      T.tap((n) => (n === 1 ? T.fail(new TooBig()) : T.unit)),
      T.catchTag("InvalidRandom", () => T.succeed(0.95)),
      T.provideAll<App.RandGen>({ rand: T.succeed(0.1) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(res)).toEqual(Ex.fail(new App.InvalidRandom({ number: 0.1 })))
  })
})
