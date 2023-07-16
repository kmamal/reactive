const { DependencyGraph } = require('./graph')
const { Value } = require('./value')
const { Computed } = require('./computed')
const { Reaction } = require('./reaction')

const makeRealm = () => {
	const graph = new DependencyGraph()

	const value = (initial, fnEq) => new Value(graph, initial, fnEq)
	const computed = (fnCalc, initial, fnEq) => new Computed(graph, fnCalc, initial, fnEq)
	const reaction = (fnDeps, fnEffect) => new Reaction(graph, fnDeps, fnEffect)

	return { graph, value, computed, reaction }
}

const defaultRealm = makeRealm()

defaultRealm.makeRealm = makeRealm

module.exports = defaultRealm
