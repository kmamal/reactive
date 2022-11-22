const { onChange, autoDeps } = require('./auto-deps')

class Reaction {
	constructor (graph, fnDeps, fnEffect = null) {
		const node = this._node = new graph.SourceNode()
		node._atom = this

		node.onChange = onChange
		const { compute, addDependency } = autoDeps(node, fnDeps)
		let ignoreDeps
		node._handleCompute = () => {
			ignoreDeps = false
			compute()
			ignoreDeps = true
			fnEffect?.()
		}
		node._handleObserve = (other) => {
			if (ignoreDeps) { return }
			addDependency(other)
		}
	}

	subscribe () { this._node.subscribe() }
	unsubscribe () { this._node.unsubscribe() }
}

module.exports = { Reaction }
