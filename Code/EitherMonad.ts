import { Fun, id } from "./Fun"

export type Either<a, b> = {
    kind: "left",
    value: a
} | {
    kind: "right",
    value: b
}

export let inl = <a, b>(): Fun<a, Either<a, b>> =>
    Fun<a, Either<a, b>>((x: a) => ({
      kind: "left",
      value: x
    }))

  
export let inr = <a, b>(): Fun<b, Either<a, b>> =>
    Fun<b, Either<a, b>>((x: b) => ({
        kind: "right",
        value: x
    }))

export let map_Either = <a, a1, b, b1>(f: Fun<a, a1>, g: Fun<b, b1>): 
  Fun<Either<a, b>, Either<a1, b1>> => {
    return Fun((e: Either<a, b>): Either<a1, b1> => {
      if (e.kind == "left") {
        let newValue = f.f(e.value)
        return inl<a1, b1>().f(newValue)
      }
      else {
        let newValue = g.f(e.value)
        return inr<a1, b1>().f(newValue)
      }
    }) // e.kind == "Left" ? f.then(inl()) : g.then(inr()) 
}

export let unit_Either = <a, b>() : Fun<a,Either<b,a>> => inr<b,a>()

export let join_Either_right = <a, b>() : Fun<Either<b,Either<b,a>>, Either<b,a>> =>
  Fun(x => x.kind === "right" ? x.value : inl<b,a>().f(x.value))

export let join_Either_left = <a, b>() : Fun<Either<Either<a, b>, b>, Either<a, b>> => 
  Fun(x => x.kind === "left" ? x.value : inr<a,b>().f(x.value))

export let bind_Either_right = <a, b, c>(f:Fun<b, Either<a, c>>) : Fun<Either<a, b>, Either<a, c>> => 
  Fun<Either<a, b>, Either<a, c>>((e:Either<a,b>) => 
  map_Either<a, a, b, Either<a, c>>(id<a>(), f)
  .then(join_Either_right()).f(e))
