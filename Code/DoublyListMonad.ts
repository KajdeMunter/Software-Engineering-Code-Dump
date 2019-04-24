import { Fun } from "./Fun";
import { Pair } from "./PairMonad"

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

let plus_DoublyList = <a>() : Fun<Pair<DoublyList<a>, DoublyList<a>>, DoublyList<a>> =>
        Fun(pair =>
            pair.fst.kind === "Cons"
            ? plus_DoublyList<a>().f(Pair(pair.fst.tail, pair.snd))
            : pair.fst = pair.snd
        )

let join_DoublyList = <a>(): Fun<DoublyList<DoublyList<a>>, DoublyList<a>> =>
    Fun(l_l =>
        l_l.kind === "Empty"
        ? l_l
        : plus_DoublyList<a>().f(Pair(l_l.head, join_DoublyList<a>().f(l_l.tail)))
      )


// Define bind for the BinaryTree to make it a monad
let bind_DoublyLinkedList = <a, b>(k: Fun<a,DoublyList<b>>) : 
  Fun<DoublyList<a>,DoublyList<b>> =>
  Fun(l => map_DoublyList(k).then(join_DoublyList()).f(l))

