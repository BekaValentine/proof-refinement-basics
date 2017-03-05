var Nothing = { tag: "Nothing" };

function Just(x) {
    return { tag: "Just", arg: x };
}

function sequence(mxs) {
    var xs = [];
    
    for (var i = 0; i < mxs.length; i++) {
        if (mxs[i].tag === "Nothing") {
            return Nothing;
        } else if (mxs[i].tag === "Just") {
            xs.push(mxs[i].arg);
        }
    }
    
    return Just(xs);
}

function eq(x,y) {
  if (x instanceof Array && y instanceof Array) {
    if (x.length != y.length) { return false; }
    
    for (var i = 0; i < x.length; i++) {
      if (!eq(x[i], y[i])) { return false; }
    }
    
    return true;
  } else if (x.tag === y.tag) {
    if (x.args && y.args) {
      return eq(x.args,y.args);
    } else if (x.arg && y.arg) {
      return eq(x.arg,y.arg);
    } else if (!x.arg && !y.arg) {
      return true;
    } else {
      return false;
    }
  }
}


function ProofTree(c,ps) {
    return { tag: "ProofTree", args: [c,ps] };
}

function findProof(j) {
    var mjs = decompose(j);
    
    if (mjs.tag === "Nothing") {
        return Nothing;
    } else if (mjs.tag === "Just") {
        let mts = sequence(mjs.arg.map(j => findProof(j)));
        if (mts.tag === "Nothing") {
            return Nothing;
        } else if (mts.tag === "Just") {
            return Just(ProofTree(j, mts.arg));
        }
    }
}



//
// Types
//

var Nat = { tag: "Nat" };

function Prod(a,b) {
    return { tag: "Prod", args: [a,b] };
}

function Arr(a,b) {
    return { tag: "Arr", args: [a,b] };
}



//
// Programs
//

function Var(x) {
    return { tag: "Var", arg: x };
}

var Zero = { tag: "Zero" };

function Suc(m) {
    return { tag: "Suc", arg: m };
}

function Pair(m,n) {
    return { tag: "Pair", args: [m,n] };
}

function Fst(a,m) {
    return { tag: "Fst", args: [a,m] };
}

function Snd(a,m) {
    return { tag: "Snd", args: [a,m] };
}

function Lam(x,m) {
    return { tag: "Lam", args: [x,m] };
}

function App(a,m,n) {
    return { tag: "App", args: [a,m,n] };
}



//
// Judgments
//

function HasType(g,m,a) {
    return { tag: "HasType", args: [g,m,a] };
}



function lookup(x,xys) {
    for (var i = 0; i < xys.length; i++) {
        if (xys[i][0] === x) {
            return Just(xys[i][1]);
        }
    }
    
    return Nothing;
}

function decomposeHasType(g,m,a) {
    if (m.tag === "Var") {
        var ma2 = lookup(m.arg, g);
        
        if (ma2.tag === "Nothing") {
            return Nothing;
        } else if (ma2.tag === "Just") {
            return eq(a,ma2.arg) ? Just([]) : Nothing;
        }
    } else if (m.tag === "Zero" && a.tag === "Nat") {
      return Just([]);
    } else if (m.tag === "Suc" && a.tag === "Nat") {
      return Just([HasType(g, m.arg, Nat)]);
    } else if (m.tag === "Pair" && a.tag === "Prod") {
        return Just([HasType(g, m.args[0], a.args[0]),
                     HasType(g, m.args[1], a.args[1])])
    } else if (m.tag === "Fst") {
        return Just([HasType(g, m.args[1], Prod(a,m.args[0]))]);
    } else if (m.tag === "Snd") {
        return Just([HasType(g, m.args[1], Prod(m.args[0],a))]);
    } else if (m.tag === "Lam" && a.tag === "Arr") {
        return Just([HasType([[m.args[0],a.args[0]]].concat(g),
                             m.args[1],
                             a.args[1])]);
    } else if (m.tag === "App") {
        return Just([HasType(g, m.args[1], Arr(m.args[0],a)),
                     HasType(g, m.args[2], m.args[0])]);
    } else {
        return Nothing;
    }
}

function decompose(j) {
    if (j.tag === "HasType") {
        return decomposeHasType(j.args[0], j.args[1], j.args[2]);
    }
}
