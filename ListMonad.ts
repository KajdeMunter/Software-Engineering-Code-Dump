import { Fun, Unit } from "./Fun"

type List<a> = {
    type: "cons",
    head: a,
    tail: List<a>
} | {
    type: "empty",
}

let Cons = <a>(a:a, t:List<a>) : List<a> => ({type: "cons", head:a, tail:t})
let Empty = <a>() : List<a> => ({type: "empty"})

let map_List = <a,b>(f:Fun<a,b>) : Fun<List<a>, List<b>> =>
    Fun<List<a>, List<b>>(l => 
    l.type === "empty" 
    ? Empty<b>() 
    : Cons<b>(f.f(l.head), map_List(f).f(l.tail)))

let unit_List = <a>() : Fun<Unit, List<a>> => Fun(u => Empty<a>())

type Pair<a,b> = { fst:a, snd:b }

let Pair = <a,b>(fst:a, snd:b) => ({fst:fst, snd:snd})

let plus_List = <a>() : Fun<Pair<List<a>, List<a>>, List<a>> =>
    Fun<Pair<List<a>, List<a>>, List<a>>(pair=>
        pair.fst.type === "cons"
        ? plus_List<a>().f({fst: pair.fst.tail, snd: pair.snd})
        : pair.fst = pair.snd
    )


let join_List = <a>() : Fun<List<List<a>>, List<a>> => 
    Fun<List<List<a>>, List<a>>((l_l:List<List<a>>) => 
        l_l.type === "empty" 
        ? l_l 
        : plus_List<a>().f({fst: l_l.head, snd: join_List<a>().f(l_l.tail)})
    )

let bind_List = <a,b>(f:Fun<a, List<b>>) : Fun<List<a>, List<b>> =>
    Fun<List<a>, List<b>>(l => map_List(f).then(join_List()).f(l))
