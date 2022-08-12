const extendGraph = require('../graph/extend')
const deriveNodeProps = require('../graph/extensions/derive-node-props')
const partialOrder = require('../graph/extensions/derivations/partial-order')
const upstream = require('../graph/extensions/derivations/propagations/upstream')

const has_source_nodes = {
	_init (next) {
		next.call(this)
		this.SourceNode = class extends this.Node {}
	},

	_initNode (next, node) {
		node._outgoing = new Map()
		node._incoming = node instanceof this.SourceNode
			? DependencyGraph.empty_map
			: new Map()
	},
}

const subscribable = {
	_init (next) {
		next.call(this)

		this.Node.prototype.subscribe = function () {
			this._graph._setSubscribed(this, true)
		}

		this.Node.prototype.unsubscribe = function () {
			this._graph._setSubscribed(this, false)
		}

		this.Node.prototype.subscribed = function () {
			return this._graph._subscribed(this)
		}
	},

	_initNode (next, node) {
		next.call(this, node)

		if (node instanceof this.SourceNode) { return }

		node._is_self_subscribed = false
	},

	_setSubscribed (next, node, flag) {
		const was_subscribed = node._is_self_subscribed

		if (flag === was_subscribed) { return }

		node._is_self_subscribed = flag
		recalculatePropSubscribed(node)
	},

	_subscribed (next, node) { return node._subscribed },
}

const subscribed_prop = {
	_subscribed: {
		derive: (node) => {
			if (node._is_self_subscribed) { return true }
			node._affects_subscribed = false
			for (const child of node.children().values()) {
				if (child.subscribed()) {
					node._affects_subscribed = true
					break
				}
			}
			return node._affects_subscribed
		},
		propagate: upstream,
	},
}

const refcount_prop = { _refcount: { derive: (node) => node.children().size } }

const { recalculate, extension } = deriveNodeProps([
	subscribed_prop,
	refcount_prop,
	partialOrder('_order'),
])

const recalculatePropSubscribed = (node) => recalculate(node, subscribed_prop)

const DependencyGraph = extendGraph([
	has_source_nodes,
	require('../graph/extensions/strong'),
	require('../graph/extensions/printable'),
	require('../graph/extensions/simple'),
	subscribable,
	extension,
	require('../graph/extensions/logging'),
])

module.exports = DependencyGraph
