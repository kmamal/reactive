
const plugin = (R) => {
	const core = R._core
	const logger = core._logger

	return class Atom {
		constructor () {
			this._node = null
		}

		_createNode () {
			this._node = new this._Node()
			this._node._atom = this
			this._node.onChange = this._onChange.bind(this)

			logger && logger.log("subscribed", this._node.toString())
		}

		_destroyNode () {
			logger && logger.log("unsubscribed", this._node.toString())

			this._node.remove()
			this._node = null
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
