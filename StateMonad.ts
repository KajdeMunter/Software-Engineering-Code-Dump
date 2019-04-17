import { Fun, id } from "./Fun";
import { Pair, map_Pair, apply_Pair } from "./PairMonad";

type State<s, a> = Fun<s, Pair<a, s>>

let map_State = <s, a, b>(f:Fun<a, b>) : Fun<State<s, a>, State<s, b>> =>
    Fun(s => s.then(map_Pair(f, id<s>())))

let unit_State = <s, a>() : Fun<a, State<s, a>> => 
    Fun(x => Fun(s => ({fst:x, snd:s})))

let join_State = <s, a>() : Fun<State<s, State<s, a>>, State<s, a>> =>
    Fun(s_s => s_s.then(apply_Pair()))

let bind_State = <s, a, b>(f: Fun<a, State<s, b>>): Fun<State<s, a>, State<s, b>> =>
    Fun<State<s, a>, State<s, b>>(s => map_State(f).then(join_State<s, b>()).f(s))