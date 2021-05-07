import * as App from "@app/exercises/day-3/01-effect"
import { pipe } from "@effect-ts/core"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"

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
})
