const { onChange, autoDeps } = require('./auto-deps')

class Reaction {
	constructor (graph, fnDeps, fnEffect = null) {
		const node = this._node = new graph.SourceNode()
		node._atom = this

		node.onChange = onChange
		const { compute, addDependency } = autoDeps(this._node, fnDeps)
		node._handleCompute = () => {
			compute()
			fnEffect?.()
		}
		node._handleObserve = addDependency
	}

	subscribe () { this._node.subscribe() }
	unsubscribe () { this._node.unsubscribe() }
}

module.exports = { Reaction }
