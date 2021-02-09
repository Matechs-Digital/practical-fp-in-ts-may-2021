import { BooleanADT } from "@app"

describe("BooleanADT", () => {
  it("Invert of True is False", () => {
    expect(BooleanADT.renderToString(BooleanADT.invert(BooleanADT.makeTrue()))).toEqual(
      "Boolean is False"
    )
  })
})
