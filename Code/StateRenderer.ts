import { Fun, Unit } from "./Fun"
import { State, make_State, unit_State, bind_State } from "./StateMonad"
import { Pair } from "./PairMonad"


// Text-based renderer
// A renderer takes a rendering buffer as input, and produces a new rendering buffer with the extra drawing operations applied to it.
type RenderingBuffer = string
type Renderer = State<RenderingBuffer, Unit>

// Unit
let render_nothing : Renderer = make_State(Fun(b => Pair({}, b)))

// Adds a string to buffer
let render_string = (s:string) : Renderer => make_State(Fun(b => Pair({}, b + s)))

// We can use this to render fixed primitives
let render_asterisk = render_string("*")
let render_space    = render_string(" ")
let render_newline  = render_string("\n")

let render_line = (n:number) : Renderer => 
  n > 0 ? render_asterisk.then(Fun((_:Unit) => render_line(n-1)))
  : render_asterisk

// The actual rendering would then be performed by running a renderer 
// (thus calling its function with some initial buffer) 
// and then printing the state from the resulting tuple:
console.log(render_line(5).run.f("").snd)
