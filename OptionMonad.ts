import { Fun } from "./Fun"

type Option<a> = {
    kind: "some",
    value: a
} | { 
    kind: "none"
}

let bind_Option = function <a,b>(this: Option<a>, k: Fun<a, Option<b>>) : Option<b> {return null!}

let None = <a>():Option<a> => ({kind:"none"})

let Some = <a>():Fun<a, Option<a>> => Fun<a, Option<a>>(x => ({ kind:"some", value:x }))

let map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>, Option<b>> =>
    Fun(x => x.kind == "none" 
    ? None<b>()
    : f.then(Some<b>()).f(x.value))

let unit_Option = <a>() : Fun<a, Option<a>> => Fun(a => None<a>())