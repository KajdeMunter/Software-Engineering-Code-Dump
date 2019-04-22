import { Fun } from "./Fun"

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

export let join_Either = <a, b>() : Fun<Either<b,Either<b,a>>, Either<b,a>> =>
  Fun(x => x.kind == "left" ? inl<b,a>().f(x.value) : x.value)

export let bind_Either = <a, b, a1, b1>(left:Fun<a, Either<a, b>>, right:Fun<b, Either<a, b>>) : Fun<Either<a, b>, Either<a1, b1>> => 
  Fun<Either<a, b>, Either<a1, b1>>((e:Either<a,b>) => 
  map_Either<a, Either<a, b>, b, Either<a, b>>(left, right)
  .then(join_Either<a, b>()).f(e))