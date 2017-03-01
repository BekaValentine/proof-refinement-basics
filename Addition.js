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


var Zero = { tag: "Zero" };

function Suc(n) {
    return { tag: "Suc", arg: n };
}

function Equal(x,y) {
    return { tag: "Equal", args: [x,y] };
}

function Plus(x,y,z) {
    return { tag: "Plus", args: [x,y,z] };
}

function decomposeEqual(x,y) {
    if (x.tag === "Zero" && y.tag == "Zero") {
        return Just([]);
    } else if (x.tag === "Suc" && y.tag === "Suc") {
        return Just([Equal(x.arg, y.arg)]);
    } else {
        return Nothing;
    }
}

function decomposePlus(x,y,z) {
    if (x.tag === "Zero") {
      return Just([Equal(y,z)]);  
    } else if (x.tag === "Suc" && z.tag === "Suc") {
        return Just([Plus(x.arg, y, z.arg)]);
    } else {
        return Nothing;
    }
}

function decompose(j) {
    if (j.tag === "Equal") {
        return decomposeEqual(j.args[0], j.args[1]);
    } else if (j.tag === "Plus") {
        return decomposePlus(j.args[0], j.args[1], j.args[2]);
    }
}
