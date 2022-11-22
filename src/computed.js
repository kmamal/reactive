const { HasValue } = require('./has-value')
const { onChange, autoDeps } = require('./auto-deps')

class Computed extends HasValue {
	constructor (graph, fnCalc, initial) {
		super(initial)
		const node = this._node = new graph.Node()
		node._atom = this

		node.onChange = onChange
		const { compute, addDependency } = autoDeps(node, fnCalc)
		node._handleCompute = () => {
			this.set(compute())
		}
		node._handleObserve = addDependency
	}
}

module.exports = { Computed }
