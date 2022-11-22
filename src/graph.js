const { extend } = require('@kmamal/graph/extend')
const { deriveNodeProps } = require('@kmamal/graph/extensions/derive-node-props')
const partialOrder = require('@kmamal/graph/extensions/derivations/partial-order')
const downstream = require('@kmamal/graph/extensions/derivations/propagations/downstream')
const { sortBy } = require('@kmamal/util/array/sort')

const EMPTY_MAP = new Map()

const partialOrderProp = partialOrder('_order')
const getOrder = (x) => x._order

const hasSourceAndSinkNodes = {
	_init (next) {
		next.call(this)
		this.SourceNode = class extends this.Node {}
		this.SinkNode = class extends this.Node {}
	},

	_initNode (next, node) {
		next.call(next, node)
		node._incoming = node instanceof this.SourceNode ? EMPTY_MAP : new Map()
		node._outgoing = node instanceof this.SinkNode ? EMPTY_MAP : new Map()
		node._hasChanged = false
		node._isPending = false
		node._isInProgress = false
	},
}

const subscribe = function () { this._graph.setSubscribed(this, true) }
const unsubscribe = function () { this._graph.setSubscribed(this, false) }
const subscribed = function () { return this._graph.subscribed(this) }
const triggerObserve = function () { return this._graph.triggerObserve(this) }
const triggerChange = function () { return this._graph.triggerChange(this) }

const reactive = {
	_init (next) {
		next.call(this)

		this.Node.prototype.subscribe = subscribe
		this.Node.prototype.unsubscribe = unsubscribe
		this.Node.prototype.subscribed = subscribed
		this.Node.prototype.triggerObserve = triggerObserve
		this.Node.prototype.triggerChange = triggerChange

		this._changed = []
		this._pending = []
		this._shouldSort = false
		this._inProgress = []

		this._processing = false
		this._suspended = 0
	},

	_initNode (next, node) {
		next.call(this, node)
		node._isSelfSubscribed = false
	},

	_startProcessing () {
		if (this._processing) { return }
		this._processing = true
		this._process()
		this._processing = false
	},

	_process () {
		// console.group("processing")

		const { _changed, _pending, _inProgress } = this
		loop: while (this._suspended === 0) {
			if (_changed.length > 0) {
				for (const node of _changed) {
					for (const affected of node.parents()) {
						if (affected._isPending || !affected._subscribed) { continue }
						this._addPending(affected)
					}
					node._hasChanged = false
				}
				_changed.length = 0
			}

			if (this._shouldSort) { sortBy.$$$(_pending, getOrder) }
			this._shouldSort = false

			let current
			do {
				if (_pending.length === 0) { break loop }
				current = _pending.pop()
				current._isPending = false
			} while (!current._subscribed || current._isInProgress)

			// console.log(current._id)

			_inProgress.push(current)
			current._isInProgress = true
			current._handleCompute()
			current._isInProgress = false
			_inProgress.pop()
		}

		// console.groupEnd()
	},

	_addPending (next, node) {
		node._isPending = true
		this._pending.push(node)
		this._shouldSort = true
	},

	setSubscribed (next, node, flag) {
		if (flag === node._isSelfSubscribed) { return }
		node._isSelfSubscribed = flag
		recalculatePropSubscribed(node)
	},

	triggerObserve (next, node) {
		// console.log('triggerObserve', node._id)
		this._inProgress.at(-1)?._handleObserve(node)
	},

	triggerChange (next, node) {
		if (!node._subscribed) { return }
		// console.log('triggerChange', node._id)
		node._hasChanged = true
		this._changed.push(node)
		this._startProcessing()
	},

	suspend () {
		this._suspended++
	},

	resume () {
		this._suspended--
		this._startProcessing()
	},
}

const subscribedProp = {
	_subscribed: {
		derive: (node) => {
			if (node._isSelfSubscribed) { return true }
			for (const affected of node.parents()) {
				if (affected._subscribed) { return true }
			}
			return false
		},
		propagate: downstream,
	},
}

const { recalculate, extension: propsExtension } = deriveNodeProps([
	partialOrderProp,
	subscribedProp,
])

const recalculatePropSubscribed = (node) => recalculate(node, subscribedProp)

const DependencyGraph = extend([
	hasSourceAndSinkNodes,
	reactive,
	propsExtension,
	// require('@kmamal/graph/src/extensions/printable'),
	// require('@kmamal/graph/src/extensions/logging'),
])

module.exports = { DependencyGraph }
