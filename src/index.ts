export const dummy = "dummy"

export namespace BooleanADT {
  export interface True {
    readonly _tag: "True"
  }

  export function makeTrue(): Boolean {
    return {
      _tag: "True"
    }
  }

  export interface False {
    readonly _tag: "False"
  }

  export function makeFalse(): Boolean {
    return {
      _tag: "False"
    }
  }

  export type Boolean = True | False

  export function invert(self: Boolean): Boolean {
    switch (self._tag) {
      case "True": {
        return makeFalse()
      }
      case "False": {
        return makeTrue()
      }
    }
  }

  export function renderToString(self: Boolean): string {
    switch (self._tag) {
      case "True": {
        return "Boolean is True"
      }
      case "False": {
        return "Boolean is False"
      }
    }
  }
}
