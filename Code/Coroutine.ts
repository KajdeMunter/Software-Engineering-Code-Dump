import { Fun, id, Unit } from "./Fun"
import { Either, inr, inl } from "./EitherMonad"
import { Pair, map_Pair } from "./PairMonad"

// The core idea of coroutines is that running the process will result in either one of three possible outomces:
// A result, error on an interruption.

// Same structure as Process. Instance of either a result (pair<a,s> containing both the final result and a state)
// or something that is not a result (NoRes<s,e,a> is either an error or the rest of the process "continuation")
// Which in turn is the current state of the process so far, and the coroutine that would perform the rest of the process.

type Coroutine<s,e,a> = Fun<s, Either<NoRes<s,e,a>,Pair<a,s>>>
type NoRes<s,e,a> = Either<e,Continuation<s,e,a>>
type Continuation<s,e,a> = Pair<s,ContinuedCoroutine<s,e,a>>

// Fix for circular reference that the example has. the rest of the code also doesn't work. 
// Cant figure out why and I can't contact the teacher. Thanks. Very nice.
interface ContinuedCoroutine<s,e,a> extends Coroutine<s,e,a> { }

// type Co<s,e,a> = Fun<s, Either<NoRes<s,e,a>,Pair<a,s>>>
// type Continuation<s,e,a> = Pair<s,Coroutine<s,e,a>>
// type NoRes<s,e,a> = Either<e,Continuation<s,e,a>>

// interface Coroutine<s, e, a> {
//     run: Co<s, e, a>
// }

let unit_Co = <s,e,a>(x:a) : Coroutine<s,e,a> =>
    Fun<s, Either<NoRes<s,e,a>, Pair<a,s>>>(s => inr<NoRes<s,e,a>, Pair<a,s>>().f({fst:x, snd:s}))

let join_Co = <s,e,a> (): Fun<Coroutine<s,e,Coroutine<s,e,a>>, Coroutine<s,e,a>> => 
    Fun(p => Fun(s => {
        let res : Either<NoRes<s,e,Coroutine<s,e,a>>, Pair<Coroutine<s,e,a>,s>> = p.f(s)

        if (res.kind == "left") {
            if (res.value.kind == "left") {
                return inl().then(inl()).f(res.value.value)
            } else {
                let rest:Pair<s,ContinuedCoroutine<s,e,ContinuedCoroutine<s,e,a>>> = res.value.value
                return inl().then(inr()).then(map_Pair(id<s>(), join_Co<s,e,a>()).f(rest))
            }
        } else {
            let final_res : Pair<Coroutine<s,e,a>, s> = res.value
            return final_res.fst.f(final_res.snd)
        }
    }))


// let map_Co = <s,e,a,b>(f:Fun<a,b>) : Fun<Coroutine<s,e,a>, Coroutine<s,e,b>> =>
//     Fun(p => Fun(s => {
//       let res : Either<NoRes<s,e,a>, Pair<a,s>> = p.f(s)
//       if (res.kind == "left") {
//         if (res.value.kind == "left") {
//           return inl().then(inl()).f(res.value.value)
//         } else {
//           let rest : Pair<s,Coroutine<s,e,a>> = res.value.value
//           return inl().then(inr()).then(map_Pair(id<s>(), map_Co(f)).f(rest))
//         }
//       } else {
//           let final_res : Pair<s,a> = res.value
//           return map_Pair(id<s>(), f).f(final_res)
//       }
//     }))

// let suspend = <s,e>() : Coroutine<s,e,Unit> =>
//     Fun(s => inl().inr().f({ x:unit_Co({}), y:s }))
