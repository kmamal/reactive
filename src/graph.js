const { extend } = require('../../graph/src/extend')
const { deriveNodeProps } = require('../../graph/src/extensions/derive-node-props')
const partialOrder = require('../../graph/src/extensions/derivations/partial-order')
const downstream = require('../../graph/src/extensions/derivations/propagations/downstream')
const { sortByPure } = require('@kmamal/util/array/sort')

const EMPTY_MAP = new Map()

const partialOrderProp = partialOrder('_order')
const getOrder = (x) => -x._order

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

		this._changed = new Set()
		this._pending = []
		this._pendingSet = new Set()
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

		const { _changed, _pending, _pendingSet, _inProgress } = this
		loop: while (this._suspended === 0) {
			for (const node of _changed) {
				for (const affected of node.parents()) {
					if (_pendingSet.has(affected)) { continue }
					if (!affected._subscribed) { continue }

					_pendingSet.add(affected)
					_pending.push(affected)
				}
			}
			_changed.clear()
			sortByPure.$$$(_pending, getOrder)

			let current
			do {
				if (_pending.length === 0) { break loop }
				current = _pending.shift()
				_pendingSet.delete(current)
			} while (!current._subscribed || _inProgress.includes(current))

			// console.log(current._id)

			_inProgress.push(current)
			current._handleCompute()
			_inProgress.pop(current)
		}

		// console.groupEnd()
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
		this._changed.add(node)
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
	//
	require('../../graph/src/extensions/printable'),
	require('../../graph/src/extensions/logging'),
])

module.exports = { DependencyGraph }
