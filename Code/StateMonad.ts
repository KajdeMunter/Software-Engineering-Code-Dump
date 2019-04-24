import * as Immutable from "immutable"
import { Fun, id, Unit } from "./Fun";
import { Pair, map_Pair, apply_Pair } from "./PairMonad";

export interface State<s, a> {
    run: Fun<s, Pair<a, s>>
    then: <b>(f: Fun<a, State<s, b>>) => State<s, b> //this is bind
    repeat: () => Fun<number, State<s, a>>
}

export let run_State = <s,a>() : Fun<State<s,a>, Fun<s, Pair<a, s>>> => Fun(s => s.run)

export let make_State = <s,a>(run:Fun<s, Pair<a, s>>) : State<s,a> => ({ 
    run:run, 
    then:function<b>(this:State<s,a>, k:Fun<a, State<s, b>>) : State<s,b> { return bind_State(this,k) }, 
    repeat:function (this: State<s,a>) : Fun<number, State<s,a>> { return Fun<number,State<s,a>>(x => repeat(this,x)) }
})

export let map_State = <s, a, b>(f:Fun<a, b>) : Fun<State<s, a>, State<s, b>> =>
    Fun(s => make_State(s.run.then(map_Pair(f, id<s>()))))

export let unit_State = <s, a>() : Fun<a, State<s, a>> => 
    Fun<a, State<s, a>>(x => 
        make_State(Fun<s, Pair<a, s>>((state: s) => Pair(x, state)))
    )

export let join_State = <s, a>() : Fun<State<s, State<s, a>>, State<s, a>> =>
    Fun(s_s => 
        make_State(s_s.run.then(map_Pair(run_State(), id())).then(apply_Pair()))
    )

export let bind_State = <s, a, b>(p: State<s, a>, f: Fun<a, State<s, b>>): State<s, b> => 
    map_State<s, a, State<s, b>>(f).then(join_State<s, b>()).f(p)

export let get_State = <s>(): State<s, s> => make_State(Fun(s => (Pair(s,s))))

export let set_State = <s>(s:s): State<s, Unit> => 
  make_State(Fun(_ => (Pair({}, s))))

export type Memory = Immutable.Map<string, number>
export type Instruction<a> = State<Memory, a>

export let get_var = (v: string): Instruction<number> =>
    bind_State(get_State(), Fun((m: Memory) =>
        unit_State<Memory, number>().f(m.get(v))
    ))

export let set_var = (v:string, n:number) : Instruction<Unit> =>
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
