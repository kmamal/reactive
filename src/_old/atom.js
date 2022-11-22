
const plugin = (R) => {
	const core = R._core
	const logger = core._logger

	return class Atom {
		constructor () {
			this._node = null
		}

		_createNode () {
			const node = this._node = new this._Node()
			node._atom = this
			node.onChange = this._onChange.bind(this)

			logger && logger.log("subscribed", node.toString())
		}

		_destroyNode () {
			const node = this._node
			this._node = null

			logger && logger.log("unsubscribed", node.toString())

			node.remove()
		}

		_onChange (prop, value) {
			if (prop !== '_subscribed') { return }
			if (value) { return }
			this._destroyNode()
		}

		accessed () { core.accessed(this) }

		async changed () { await core.changed(this) }
	}
}

module.exports = plugin
