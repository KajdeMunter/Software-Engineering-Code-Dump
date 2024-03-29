import * as Immutable from "immutable"
import { Fun } from "./Fun";

let incr = Fun((x: number) => x + 1)
let double = Fun((x: number) => x * 2)
let square = Fun((x: number) => x * x)
let isPositive = Fun((x: number) => x > 0)
let isEven = Fun((x: number) => x % 2 == 0)
let invert = Fun((x: number) => -x)
let squareRoot = Fun((x: number) => Math.sqrt(x))
let convert = Fun<number, string>(x => String(x))
let ifThenElse =
    function <a, b>(p: Fun<a, boolean>, _then: Fun<a, b>, _else: Fun<a, b>): Fun<a, b> {
        return Fun((x: a) => {
            if (p.f(x)) {
                return _then.f(x)
            }
            else {
                return _else.f(x)
            }
        })
    }

// Increment a number and then check if it is positive
console.log(incr.then(isPositive).f(-2));

// Increment a number, double it and check if it is positive
console.log(incr.then(double).then(isPositive).f(5));

// Implement a function that computes the square root if the input is positive, otherwise inverts it and then performs the square root
console.log(ifThenElse(isPositive, squareRoot, invert.then(squareRoot)).f(3));

// Square a number and then if it is even invert it otherwise do the square root
console.log(square.then(ifThenElse(isEven, invert, squareRoot)).f(4));


type List<a> = {
    kind: "Cons"
    head: a
    tail: List<a>
  } | {
    kind: "Empty"
  }

// Constructor to create cons
let Cons = <a>(val:a, t:List<a>): List<a> => {
    return {
        kind: "Cons",
        head: val,
        tail: t
    }
}

// Constructor to create empty
let Empty = <a>(): List<a> =>  { 
    return {
        kind: "Empty"
    } 
}

let hiList = Cons<string>("h", Cons<string>("i", Empty<string>()))

let map_list = <a,b>(f:Fun<a,b>): Fun<List<a>,List<b>> => 
    Fun(l => 
        l.kind === "Cons" 
        ? Cons<b>(f.f(l.head), map_list(f).f(l.tail)) 
        : Empty<b>());


let encode: Fun<number, Fun<List<string>, List<string>>> = 
    Fun((n: number) => map_list(Fun<string,string>(s => String.fromCharCode(s.charCodeAt(0) + n))));
    
console.log(encode.f(3).f(hiList))  

/*
Implement an Exception Functor Exception<a> where its data structure is defined with a discriminate union made of Result and Error. 
Result contains an element of type a while Error contains a string reporting an error message.
*/
type Result<a> = {
    el:a
}

type Error = {
    err:string
}

type Ex<a> = Result<a> | Error

/*
Consider a tile game where each tile can be either terrain, a town, or an army. 
The player can build a town converting a terrain tile to a town, 
destroy a town or an army reverting a town back to a terrain tile, or moving an army changing a terrain tile into an army tile. 
Any other combination keeps the tile as it is.

Implement the tile as a Tile Functor whose data structure is Tile<a>, where a defines the kind of tile.

Implement the composite functor List<Tile<a>> that converts all the tiles of type a in a different tile.
*/

type TileType = "terrain" | "town" | "army"

type Tile<TileType> = { kind:TileType }

let tile = () : Fun<TileType, Tile<TileType>> => 
  Fun(tile => ({ kind:tile }))

let map_tile = <a extends TileType, b extends TileType>(f: Fun<a,b>) : Fun<Tile<a>, Tile<b>> =>
  Fun(tile => ({kind:f.f(tile.kind)}))

type Unit = {}
let Unit : Unit = {}

type Pair<a,b> = { fst:a, snd:b }

let Pair = <a,b>(fst:a, snd:b) => ({fst:fst, snd:snd})

let map_pair = <a,b,c,d>(ffst:Fun<a,c>, fsnd: Fun<b,d>): Fun<Pair<a,b>, Pair<c,d>> =>
    Fun(pair => Pair(ffst.f(pair.fst), fsnd.f(pair.snd)))

let zero_int : Fun<Unit,number> = Fun((_:Unit) => 0)
let plus_int : Fun<Pair<number,number>, number> = Fun(pair => pair.fst + pair.snd)

type Id<a> = a
let id = <a>() : Fun<a,a> => Fun(x => x)
let map_Id = <a,b>(f:Fun<a,b>) : Fun<Id<a>, Id<b>> => f

// MONOID
// (+): Monoid<a> -> Monoid<a> -> Monoid<a>
// X + zero = zero + x = x IDENTITY PROPERTY
// x + (y + z) = (x + y) + z

// STRING
// (concat) string->string->string
// s concat "" = "" concat s = s
// zero := ""

// LIST
// zero := []
// [1;2;3] @ [] = [] fuck dit

// Define strings in terms of the string monoid, characterized by:
// let zero: Fun<Unit,string>
// let plus: Fun<Pair<string,string>,string> 

let zero_string: Fun<Unit,string> = Fun((_:Unit) => "")
let plus_string: Fun<Pair<string, string>, string> = Fun(pair => `${pair.fst}${pair.snd}`);

// Define the list as a monoid with the following monoidal operations:

// let zero: <a>() => Fun<unit, List<a>>
// let plus: <a>() => Fun<Pair<List<a>,List<a>>,List<a>>
// where plus is the list concatenation.

let zero_list = <a>():Fun<Unit, List<a>> => Fun((_:Unit) => Empty<a>())
let plus_list = <a>():Fun<Pair<List<a>,List<a>>,List<a>> => 
    Fun<Pair<List<a>, List<a>>, List<a>>(
        pair => pair.fst.kind === "Cons"
        ? plus_list<a>().f({fst: pair.fst.tail, snd: pair.snd})
        : pair.fst = pair.snd
    )

// Extend the Option functor with the monoid operations for functors:

// let unit: <a>() => Func<a, Option<a>>
// let join: <a>() => Func<Option<Option<a>>, Option<a>>

type Option<a> = { 
    kind:"none"
} | { 
    kind:"some", value:a 
}

let None = <a>():Option<a> => ({kind:"none"})

let Some = <a>():Fun<a, Option<a>> => Fun<a, Option<a>>(x => ({ kind:"some", value:x }))

let map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>, Option<b>> =>
  Fun(x => x.kind == "none" 
  ? None<b>()
  : f.then(Some<b>()).f(x.value))

let unit_option = <a>():Fun<a, Option<a>> => Some<a>()

let join_option = <a>():Fun<Option<Option<a>>, Option<a>> => Fun(x => x.kind == "some" ? x.value : None<a>())

let bind_option = <a,b>(k: Fun<a, Option<b>>): Fun<Option<a>, Option<b>> =>
    map_Option(k).then(join_option<b>())

// Extend the List functor with the monoid operations for functors:

// let unit: <a>() => Fun<a, List<a>>
// let join: <a>() => Fun<List<List<a>>, List<a>>
// Hint: the `plus` function you defined for lists in a previous exercise might come in handy!

let unit_list = <a>():Fun<a, List<a>> => Fun((_:a) => Empty<a>());
let join_list = <a>():Fun<List<List<a>>, List<a>> => 
  Fun(l_l => l_l.kind === "Empty" ? l_l : plus_list<a>().f({fst: l_l.head, snd: join_list<a>().f(l_l.tail)}))
 
//let then_F = <a,b>(f:Fun<a,F<b>>, g:Fun<b,F<c>>) : Fun<a,F<c>> =>
//  f.then(map_F<b,F<c>>(g)).then(join_F<c>())

// Implement the bind operator for the List monoid:
// let bind = function<a, b>(k: Fun<a, List<b>>): Fun<List<a>,List<b>> {...}

let bind_list = <a,b>(k: Fun<a, List<b>>): Fun<List<a>, List<b>> =>
    map_list(k).then(join_list<b>())

// Define the Set functor. A set is a data structure containing non-repeated elements of type `a`. Implement the `map_Set` function to give it a functorial structure:

// let map_Set = <a, b>(f: Fun<a, b>): Fun<Set<a>, Set<b>>
// Extend the Set functor with unit and join to give it a monoidal structure

// let unit_Set = <a>(): Fun<a, Set<a>>
// let join_set = <a>(): Fun<Set<Set<a>>, Set<a>>
// Extend the Set monoid with bind to give it a monadic structure

// let bind = <a, b>(k: Fun<a, Set<b>>): Fun<Set<a>,Set<b>>





// Create a DoublyLinkedList<a> functor. A doubly linked list is a data structure with two cases:

// An empty list.
// An element preceeded by a doubly linked list and a followed by another doubly linked list.

type DoublyList<a> = {
    kind: "Cons"
    head: a
    tail: DoublyList<a>
    prev: DoublyList<a>
  } | {
    kind: "Empty"
  }


// Constructor to create cons
let DoublyCons = <a>(val:a, t:DoublyList<a>, p:DoublyList<a>): DoublyList<a> =>
    ({
        kind: "Cons",
        head: val,
        tail: t,
        prev: p
    })

// Constructor to create empty
let DoublyEmpty = <a>(): DoublyList<a> =>  ({ kind: "Empty" })


// Implement the map_DoublyLinkedList function for a Binary Tree.
let map_DoublyList = <a, b>(f: Fun<a, b>) : Fun<DoublyList<a>, DoublyList<b>> =>
    Fun(l =>
        l.kind === "Empty"
        ? DoublyEmpty<b>()
        : DoublyCons<b>(f.f(l.head), map_DoublyList(f).f(l.tail), map_DoublyList(f).f(l.prev)) // This might not work as the prev is already done. 
    )


// Extend this functor with join and unit and give it a monoidal structure.

let unit_DoublyList = <a>() : Fun<a, DoublyList<a>> => Fun(_ => DoublyEmpty<a>())

// let join_DoublyList = <a>(): Fun<DoublyList<DoublyList<a>>, DoublyList<a>> =>
//     Fun(l_l =>
//         l_l.kind === "Empty"
//         ? l_l
//         : 
//       )


// Define bind for the BinaryTree to make it a monad
// let bind_DoublyLinkedList = <a, b>(k: Fun<a,DoublyLinkedList<b>>) : 
//   Fun<DoublyLinkedList<a>,DoublyLinkedList<b>>


/*
Build a function that simulates a connection to a Server that might fail. 
This function takes as input the IP address of the server as a string. 
The function fails if the IP is invalid or randomly because of network errors. 
If it succeeds the function returns a data structure representing the content of the server. 

Use the following data structure to represent a server connection:
*/
interface ServerConnection {
  ip: string //ip address
  hello: string //hello message
}

// and store a collection of servers in a global variable. Use Math.random to simulate a network failure with a probability of 15% (in this case the function returns `none`).

let connect = () : Fun<string, Option<ServerConnection>> => 
    Fun(s => Math.random() < 0.15 ? None<ServerConnection>() : Some<ServerConnection>().f({ip:s, hello:"Hello World!"}))

/*
Build a function that simulates a request to a Server after a successful connection. 
This function takes as input a ServerConnection. The function might fail with a probability of 25% due to server bottlenecks or network errors. 
If it succeeds it returns the content of the server. Represent the content of the server as:
*/
interface ServerContent {
  ip: string //ip address
  content: string //content message
}

let get = (): Fun<ServerConnection, Option<ServerContent>> => 
    Fun(s => Math.random() < 0.75 ? Some<ServerContent>().f({ip: s.ip, content: "Server Content"}) : None<ServerContent>())


/*
Build a function that uses the option monad and bind_Option to handle the server connection.
This function first requests the connection and prints the welcome message from the server. 
After this it uses the server connection to get the content of the server and prints it.
*/
let handlecon = (ip: string): Option<ServerContent> =>
    bind_option(connect()).then(
    bind_option(get())
    ).f(Some<string>().f(ip))

// let con = connect(ip);
// let getcon = get(ip);

// if(con.kind === "none") {
//     return None<ServerContent>();
// } else {
//     console.log(con.value.hello);
//     if(getcon.kind === "none") {
//         return None<ServerContent>();
//     } else {
//         console.log(getcon.value.content)
//         return Some<ServerContent>().f(getcon.value)
//     }
// }

for(let i = 0; i < 10; i++) {
    console.log(handlecon("kaas"))
}

// Either implementation
type Either<a, b> = {
    kind: "left",
    value: a
} | {
    kind: "right",
    value: b
}

let inl = <a, b>(): Fun<a, Either<a, b>> => {
    return Fun<a, Either<a, b>>((x: a) => {
      return {
      kind: "left",
      value: x
    }})
}
  
let inr = <a, b>(): Fun<b, Either<a, b>> => {
    return Fun<b, Either<a, b>>((x: b) => {
        return {
        kind: "right",
        value: x
    }})
}

let map_Either = <a, a1, b, b1>(f: Fun<a, a1>, g: Fun<b, b1>): 
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

let unit_Either = <a, b>() : Fun<a,Either<b,a>> => inr<b,a>()

let join_Either = <a, b>() : Fun<Either<b,Either<b,a>>, Either<b,a>> =>
  Fun(x => x.kind == "left" ? inl<b,a>().f(x.value) : x.value)


// Define an exception type as
type Exception<a> = Either<string,a>

// Use the Exception monad to re-implement the functions of Question 1. This time report a message for each separate failure event in the following way:

 

// In connect report a different exception message for a connection failure or an invalid ip. Use two different probabilities for the failures

// In get report a different exception message for a connection failure or server unavailability. Use two different probabilities for the failures.

// The function fetch should use bind_Either in combination with the new versions of connect and get.

// Lecture 6

// Let us consider a process that works on state. Such a process will be able, at all times, to both read from and write to the state.
// It also represents a computation and it will therefore produce a result of an arbitraty type.

interface State<s, a> {
  run: Fun<s, Pair<a, s>>
  then: <b>(f: Fun<a, State<s, b>>) => State<s, b> //this is bind
}

let run_State = <s,a>() : Fun<State<s,a>, Fun<s, Pair<a, s>>> => Fun(s => s.run)

let make_State = <s,a>(run:Fun<s, Pair<a, s>>) : State<s,a> => ({ 
    run:run, 
    then:function<b>(this:State<s,a>, k:Fun<a, State<s, b>>) : State<s,b> { return bind_State(this,k) } 
  })

let map_State = <s, a, b>(f: Fun<a, b>): Fun<State<s, a>, State<s, b>> =>
  Fun((p: State<s, a>) => make_State(p.run.then(map_pair(f, id<s>()))))

let unit_State = <s, a>(): Fun<a, State<s, a>> => 
  Fun((x: a) => 
    make_State(Fun<s, Pair<a, s>>((state: s) => Pair(x, state)))
  )

let apply = <a, b>(): Fun<Pair<Fun<a, b>, a>, b> => 
  Fun((p: Pair<Fun<a, b>, a>): b => p.fst.f(p.snd))

let join_State = <s, a>(): Fun<State<s, State<s, a>>, State<s, a>> => 
  Fun((p: State<s, State<s, a>>): State<s, a> => 
    make_State(p.run.then(map_pair(run_State(), id())).then(apply()))
  )

let bind_State = <s, a, b>(p: State<s, a>, f: Fun<a, State<s, b>>): State<s, b> => 
  map_State<s, a, State<s, b>>(f).then(join_State<s, b>()).f(p)

let get_State = <s>(): State<s, s> => 
  make_State(Fun<s, Pair<s, s>>((state: s) => Pair(state, state)))

let set_State = <s>(state: s): State<s, Unit> => 
  make_State(Fun<s, Pair<Unit, s>>((_: s) => Pair({}, state)))

// Text-based renderer
// A renderer takes a rendering buffer as input, and produces a new rendering buffer with the extra drawing operations applied to it.
type RenderingBuffer = string
type Renderer = State<RenderingBuffer, Unit>

// Unit
let render_nothing : Renderer = make_State(Fun(b => ({ fst: {}, snd: b })))

// Adds a string to buffer
let render_string = (s:string) : Renderer => make_State(Fun(b => ({ fst:{}, snd:b + s})))

// We can use this to render fixed primitives
let render_asterisk = render_string("*")
let render_space    = render_string(" ")
let render_newline  = render_string("\n")

// let render_repeat = <s,a>(n:number, f:(_:a) => State<s,a>) : (_:a) => State<s,Unit> =>
//   a =>
//     n == 0 ? unit_State()
//     : f(a).then(a => render_repeat(n-1, f)(a))

// let render_line = (n:number) : Renderer => 
//   render_repeat<RenderingBuffer,Unit>(n, _ => render_asterisk)({})



// An instruction produces either a result, or a change in memory, and is always able to read from memory to perform its action. 
// This is modeled with a generic instruction as follows:
type Memory = Immutable.Map<string, number>
type Instruction<a> = State<Memory, a>

let get_var = (_var: string): Instruction<number> =>
    bind_State(get_State(), Fun((m: Memory) =>
        unit_State<Memory, number>().f(m.get(_var))
    ))

let set_var = (_var: string, value: number): Instruction<Unit> =>
    bind_State(get_State(), Fun((m: Memory) =>
        set_State(m.set(_var, value))
    ))

let incr_var = (_var : string): Instruction<Unit> =>
    get_var(_var).then(Fun((v: number) => set_var(_var, v + 1)))

let swap_var_and_incr = (var1: string, var2: string): Instruction<Unit> => 
    get_var(var1).then(Fun((v1: number) =>
    get_var(var2).then(Fun((v2: number) =>
    set_var(var1, v2).then(Fun((_: Unit) =>
    set_var(var2, v1).then(Fun((_:Unit) =>
    incr_var(var1).then(Fun((_:Unit) =>
    incr_var(var2)
    ))))))))))

// Extend the imperative language defined in class with the State monad to include the evaluation of a code block:
let seq = (current: Instruction<Unit>, next: Instruction<Unit>): Instruction<Unit> => 
    current.then(Fun((_: Unit) => next))

// A code block always terminates with a special statement that does nothing. This is also used to define empty blocks
let skip = (): Instruction<Unit> => unit_State<Memory, Unit>().f({})

// Extend the imperative language seen in class with the State monad to include a conditional statement:
// This statement uses bind_State to evaluate the condition. 
// If the condition evaluates to true it runs _then otherwise it runs _else. 
// Note that _then and _else may be code blocks (see Question 1).

let _ifThenElse = (condition: Instruction<boolean>, _then: Instruction<Unit>, _else: Instruction<Unit>): Instruction<Unit> =>
    condition.then(Fun(c => c ? _then : _else))

// Extend the imperative language defined with the State monad to include a loop instruction.
// This function uses bind_State (now `then`) to evaluate the condition.
// If the result is true then body is evaluated and then recursively the whole _while is re-evaluated again. 
// If the condition is false the statement does nothing (you can use `skip` in this case).
let _while = (condition: Instruction<boolean>, body: Instruction<Unit>): Instruction<Unit> => 
    condition.then(Fun(c => 
        c ? body.then(Fun((_: Unit) => _while(condition, body))) : skip()
    ))

// we could consider combining the Either and State monads into a single monad, which we will call Process:
type Process<s,e,a> = Fun<s, Either<e, Pair<a,s>>>

let unit_Process = <s, e, a>() : Fun<a, Process<s, e, a>> => 
  Fun((x:a) => Fun((state:s) => unit_Either<Pair<a, s>, e>().f(Pair(x, state))))

// Joining processes requires launching a process, then propagating the possible errors (the left hand side of map_Either) 
// and then joining the resulting nested Either after the nested inner process has been evaluated as well.
let join_Process = <s, e, a>() : Fun<Process<s, e, Process<s, e, a>>, Process<s, e, a>> =>
  Fun(p_p => p_p.then(map_Either(id<e>(), apply())).then(join_Either()))

let map_Process = <s, e, a, b>(f: Fun<a, b>) : Fun<Process<s, e, a>, Process<s, e, b>> => 
  Fun(p => p.then(map_Either(id<e>(), map_pair(f, id<s>()))))

type P_error = string
type P_instruction<a> = Process<Memory, P_error, a>

// The core instructions therefore become reading and writing to memory, 
// but this time, when the variable name is not available, we can gracefully handle the error:

// let p_get_var = (v:string) : P_instruction<number> =>
//   get_State().then(Fun((m:Memory) =>
//       m.has(v) ? unit_Process<Memory, P_error, number>().f(m.get(v))
//       : inl<{}, Either().f(`Error: variable ${v} does not exist`)
//     )
//   )
  
let sget_var = (_var: string): Instruction<number> =>
  bind_State(get_State(), Fun((m: Memory) =>
      unit_State<Memory, number>().f(m.get(_var))
  ))

// let p_set_var = (v:string, n:number) : P_instruction<Unit> =>
//   get_State().then(Fun((m:Memory) =>
//   set_State(m.set(v, n))))

