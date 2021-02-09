import * as E from "@effect-ts/core/Either"

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

export namespace Pipeable {
  export function add(n: number) {
    return (self: number): number => self + n
  }
  export function renderToString(n: number): string {
    return `result is ${n}`
  }
}

export namespace SimpleIO {
  export interface Succeed<A> {
    readonly _tag: "Succeed"
    readonly use: <X>(go: (_: A) => X) => X
  }

  export function succeed<A>(a: A): IO<A> {
    return {
      _tag: "Succeed",
      use: (go) => go(a)
    }
  }

  export interface Map<A> {
    readonly _tag: "Map"
    readonly use: <X>(go: <B>(fa: IO<B>, f: (a: B) => A) => X) => X
  }

  export function map<A, B>(f: (a: A) => B) {
    return (self: IO<A>): IO<B> => ({
      _tag: "Map",
      use: (go) => go(self, f)
    })
  }

  export interface Chain<A> {
    readonly _tag: "Chain"
    readonly use: <X>(go: <B>(fa: IO<B>, f: (a: B) => IO<A>) => X) => X
  }

  export function chain<A, B>(f: (a: A) => IO<B>) {
    return (self: IO<A>): IO<B> => ({
      _tag: "Chain",
      use: (go) => go(self, f)
    })
  }

  export interface Suspend<A> {
    readonly _tag: "Suspend"
    readonly use: <X>(go: (f: () => IO<A>) => X) => X
  }

  export function suspend<A>(f: () => IO<A>): IO<A> {
    return {
      _tag: "Suspend",
      use: (go) => go(f)
    }
  }

  export type IO<A> = Succeed<A> | Map<A> | Chain<A> | Suspend<A>

  export function run<A>(self: IO<A>): A {
    switch (self._tag) {
      case "Succeed": {
        return self.use((a) => a)
      }
      case "Map": {
        return self.use((fa, f) => f(run(fa)))
      }
      case "Chain": {
        return self.use((fa, f) => run(f(run(fa))))
      }
      case "Suspend": {
        return self.use((f) => run(f()))
      }
    }
  }

  interface ApplyFrame {
    readonly _tag: "ApplyFrame"
    readonly apply: (a: unknown) => IO<unknown>
  }

  function applyFrame(f: (a: unknown) => IO<unknown>): StackFrame {
    return {
      _tag: "ApplyFrame",
      apply: f
    }
  }

  type StackFrame = ApplyFrame

  export function runSafe<A>(self: IO<A>): A {
    // eslint-disable-next-line prefer-const
    let maybeCurrent: IO<unknown> | undefined = self
    let value: unknown | undefined = undefined
    const stack: Array<StackFrame> = []

    while (maybeCurrent) {
      const current = maybeCurrent

      switch (current._tag) {
        case "Succeed": {
          value = current.use((a) => a)
          maybeCurrent = undefined
          break
        }
        case "Map": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              applyFrame((a) =>
                // @ts-expect-error
                succeed(f(a))
              )
            )
          })
          break
        }
        case "Chain": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              // @ts-expect-error
              applyFrame(f)
            )
          })
          break
        }
        case "Suspend": {
          current.use((f) => {
            maybeCurrent = f()
          })
          break
        }
      }

      if (!maybeCurrent && stack.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const frame = stack.pop()!
        maybeCurrent = frame.apply(value)
      }
    }

    // @ts-expect-error
    return value
  }
}

export namespace EIO {
  export interface Succeed<A> {
    readonly _tag: "Succeed"
    readonly use: <X>(go: (_: A) => X) => X
  }

  export function succeed<A>(a: A): IO<never, A> {
    return {
      _tag: "Succeed",
      use: (go) => go(a)
    }
  }

  export interface Fail<E> {
    readonly _tag: "Fail"
    readonly use: <X>(go: (_: E) => X) => X
  }

  export function fail<E>(e: E): IO<E, never> {
    return {
      _tag: "Fail",
      use: (go) => go(e)
    }
  }

  export interface Map<E, A> {
    readonly _tag: "Map"
    readonly use: <X>(go: <B>(fa: IO<E, B>, f: (a: B) => A) => X) => X
  }

  export function map<A, B>(f: (a: A) => B) {
    return <E>(self: IO<E, A>): IO<E, B> => ({
      _tag: "Map",
      use: (go) => go(self, f)
    })
  }

  export interface Chain<E, A> {
    readonly _tag: "Chain"
    readonly use: <X>(go: <B>(fa: IO<E, B>, f: (a: B) => IO<E, A>) => X) => X
  }

  export function chain<A, E2, B>(f: (a: A) => IO<E2, B>) {
    return <E>(self: IO<E, A>): IO<E | E2, B> => ({
      _tag: "Chain",
      use: (go) => go(self, f)
    })
  }

  export interface CatchAll<E, A> {
    readonly _tag: "CatchAll"
    readonly use: <X>(go: <E1>(fa: IO<E1, A>, f: (a: E1) => IO<E, A>) => X) => X
  }

  export function catchAll<E, E2, B>(f: (a: E) => IO<E2, B>) {
    return <A>(self: IO<E, A>): IO<E2, A | B> => ({
      _tag: "CatchAll",
      use: (go) => go(self, f)
    })
  }

  export interface Suspend<E, A> {
    readonly _tag: "Suspend"
    readonly use: <X>(go: (f: () => IO<E, A>) => X) => X
  }

  export function suspend<E, A>(f: () => IO<E, A>): IO<E, A> {
    return {
      _tag: "Suspend",
      use: (go) => go(f)
    }
  }

  export type IO<E, A> =
    | Succeed<A>
    | Map<E, A>
    | Chain<E, A>
    | Suspend<E, A>
    | Fail<E>
    | CatchAll<E, A>

  export function run<E, A>(self: IO<E, A>): E.Either<E, A> {
    switch (self._tag) {
      case "Succeed": {
        return E.right(self.use((a) => a))
      }
      case "Map": {
        return self.use((fa, f) => {
          const res = run(fa)
          if (res._tag === "Right") {
            return E.right(f(res.right))
          } else {
            return E.left(res.left)
          }
        })
      }
      case "Chain": {
        return self.use((fa, f) => {
          const res = run(fa)
          if (res._tag === "Right") {
            return run(f(res.right))
          } else {
            return E.left(res.left)
          }
        })
      }
      case "Fail": {
        return self.use((e) => E.left(e))
      }
      case "Suspend": {
        return self.use((f) => run(f()))
      }
      case "CatchAll": {
        return self.use((fa, f) => {
          const res = run(fa)
          if (res._tag === "Left") {
            return run(f(res.left))
          } else {
            return E.right(res.right)
          }
        })
      }
    }
  }

  interface ApplyFrame {
    readonly _tag: "ApplyFrame"
    readonly apply: (a: unknown) => IO<unknown, unknown>
  }
  interface CatchFrame {
    readonly _tag: "CatchFrame"
    readonly apply: (a: unknown) => IO<unknown, unknown>
    readonly catchAll: (e: unknown) => IO<unknown, unknown>
  }

  function applyFrame(f: (a: unknown) => IO<unknown, unknown>): StackFrame {
    return {
      _tag: "ApplyFrame",
      apply: f
    }
  }
  function catchFrame(f: (e: unknown) => IO<unknown, unknown>): StackFrame {
    return {
      _tag: "CatchFrame",
      apply: succeed,
      catchAll: f
    }
  }

  type StackFrame = ApplyFrame | CatchFrame

  export function runSafe<E, A>(self: IO<E, A>): E.Either<E, A> {
    // eslint-disable-next-line prefer-const
    let maybeCurrent: IO<unknown, unknown> | undefined = self
    let value: unknown | undefined = undefined
    let errored = false
    const stack: Array<StackFrame> = []

    while (maybeCurrent) {
      const current = maybeCurrent

      switch (current._tag) {
        case "Succeed": {
          value = current.use((a) => a)
          maybeCurrent = undefined
          break
        }
        case "Map": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              applyFrame((a) =>
                // @ts-expect-error
                succeed(f(a))
              )
            )
          })
          break
        }
        case "Chain": {
          current.use((fa, f) => {
            maybeCurrent = fa
            stack.push(
              // @ts-expect-error
              applyFrame(f)
            )
          })
          break
        }
        case "Suspend": {
          current.use((f) => {
            maybeCurrent = f()
          })
          break
        }
        case "Fail": {
          current.use((e) => {
            errored = true
            value = e
            maybeCurrent = undefined
          })
          while (stack.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const frame = stack.pop()!
            if (frame._tag === "CatchFrame") {
              maybeCurrent = frame.catchAll(value)
              errored = false
              break
            }
          }
          break
        }
        case "CatchAll": {
          current.use((fa, f) => {
            stack.push(
              // @ts-expect-error
              catchFrame(f)
            )
            maybeCurrent = fa
          })
          break
        }
      }

      if (!maybeCurrent && stack.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const frame = stack.pop()!
        maybeCurrent = frame.apply(value)
      }
    }

    // @ts-expect-error
    return errored ? E.left(value) : E.right(value)
  }
}
