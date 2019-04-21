import * as Immutable from "immutable"
import { Fun, id, Unit } from "./Fun";
import { Pair, map_Pair, apply_Pair } from "./PairMonad";

interface State<s, a> {
    run: Fun<s, Pair<a, s>>
    then: <b>(f: Fun<a, State<s, b>>) => State<s, b> //this is bind
}

let run_State = <s,a>() : Fun<State<s,a>, Fun<s, Pair<a, s>>> => Fun(s => s.run)

let make_State = <s,a>(run:Fun<s, Pair<a, s>>) : State<s,a> => ({ 
    run:run, 
    then:function<b>(this:State<s,a>, k:Fun<a, State<s, b>>) : State<s,b> { return bind_State(this,k) } 
})

let map_State = <s, a, b>(f:Fun<a, b>) : Fun<State<s, a>, State<s, b>> =>
    Fun(s => make_State(s.run.then(map_Pair(f, id<s>()))))

let unit_State = <s, a>() : Fun<a, State<s, a>> => 
    Fun<a, State<s, a>>(x => 
        make_State(Fun<s, Pair<a, s>>((state: s) => Pair(x, state)))
    )

let join_State = <s, a>() : Fun<State<s, State<s, a>>, State<s, a>> =>
    Fun(s_s => 
        make_State(s_s.run.then(map_Pair(run_State(), id())).then(apply_Pair()))
    )

let bind_State = <s, a, b>(p: State<s, a>, f: Fun<a, State<s, b>>): State<s, b> => 
    map_State<s, a, State<s, b>>(f).then(join_State<s, b>()).f(p)

let get_State = <s>(): State<s, s> => make_State(Fun(s => (Pair(s,s))))

let set_State = <s>(s:s): State<s, Unit> => 
  make_State(Fun(_ => (Pair({}, s))))

type Memory = Immutable.Map<string, number>
type Instruction<a> = State<Memory, a>

let get_var = (v: string): Instruction<number> =>
    bind_State(get_State(), Fun((m: Memory) =>
        unit_State<Memory, number>().f(m.get(v))
    ))

let set_var = (v:string, n:number) : Instruction<Unit> =>
    bind_State(get_State(), Fun(m =>
        set_State(m.set(v,n))
    ))

let incr_var = (v : string): Instruction<Unit> =>
    get_var(v).then(Fun((v_val: number) => 
    set_var(v, v_val + 1)))

let swap_a_b = () : Instruction<Unit> =>
    get_var("a").then(Fun(a_val =>
    get_var("b").then(Fun(b_val =>
    set_var("b", a_val).then(Fun(_ =>
    set_var("a", b_val)))))))
