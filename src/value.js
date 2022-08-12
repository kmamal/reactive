const { HasValue } = require('./has-value')

class Value extends HasValue {
	constructor (graph, initial) {
		super(initial)
		const node = this._node = new graph.SinkNode()
		node._atom = this
	}
}

module.exports = { Value }
