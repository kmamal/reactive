const { HasValue } = require('./has-value')

class Value extends HasValue {
	constructor (graph, initial, fnEq) {
		super(initial, fnEq)
		const node = this._node = new graph.SinkNode()
		node._atom = this
	}
}

module.exports = { Value }
