export type Fun<a,b> = {
    f: (_:a) => b,
    then: <c>(_:Fun<b,c>) => Fun<a,c>,
    repeat: () => Fun<number, Fun<a, a>>
}

export let Fun = <a,b>(f: (_:a) => b): Fun<a,b> => {
    return {
        f: f,
        then: function <c>(g: Fun<b,c>) : Fun<a,c> {
            return then(this, g)
        },
        repeat: function (this: Fun<a, a>): Fun<number, Fun<a, a>> {
            return Fun<number, Fun<a, a>>(x => repeat(this, x));
        }
    }
}

export let then = <a,b,c>(f: Fun<a,b>, g: Fun<b,c>): Fun<a,c> =>
    Fun<a,c>(x => g.f(f.f(x)))


export let repeat = <a>(f: Fun<a, a>, n: number): Fun<a, a> => {
    if (n <= 0) {
        return f;
    }
    else {
        return f.then(repeat(f, n-1));
    }
}
    
