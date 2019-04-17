import { Fun } from "./Fun";

export type Pair<a,b> = { fst:a, snd:b }

export let Pair = <a,b>(fst:a, snd:b) => ({fst:fst, snd:snd})

export let map_Pair = <a,b,c,d>(ffst:Fun<a,c>, fsnd: Fun<b,d>): Fun<Pair<a,b>, Pair<c,d>> =>
    Fun(pair => Pair(ffst.f(pair.fst), fsnd.f(pair.snd)))

// Applies pair.snd to the Fun in pair.fst
export let apply_Pair = <a, b>(): Fun<Pair<Fun<a,b>,a> ,b> => 
    Fun(fa => fa.fst.f(fa.snd))

