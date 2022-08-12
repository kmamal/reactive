const { DependencyGraph } = require('./graph')
const { Value } = require('./value')
const { Computed } = require('./computed')
const { Reaction } = require('./reaction')

const g = new DependencyGraph()

const a = new Value(g, 3)
a._node._id = "a"
const b = new Value(g, 5)
b._node._id = "b"
const c = new Value(g, 7)
c._node._id = "c"
const d = new Value(g, 9)
d._node._id = "d"

const ab = new Computed(g, () => a.get() + b.get())
ab._node._id = "ab"
const cd = new Computed(g, () => c.get() + d.get())
cd._node._id = "cd"

const abcd = new Computed(g, () => ab.get() + cd.get())
abcd._node._id = "abcd"

const r = new Reaction(g, () => { console.log({ abcd: abcd.get() }) })
r._node._id = "r"
r.subscribe()

module.exports = { g, a, b, c, d, ab, cd, abcd, r }
