import * as App from "@app/exercises/day-3/01-effect"
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
})
