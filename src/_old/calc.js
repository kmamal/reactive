
const plugin = (R) => {
	const core = R._core

	return class Calc extends R.Value {
		constructor (calc) {
			super()
			this._calc = calc
		}

		_onChange (prop, value) {
			if (prop !== '_subscribed') { return }
			if (value) {
				// TODO: I used to have the following special case:
				// When subscribed, mark for calculation, instead of calculating
				core.calculate(this)
			} else {
				this._destroyNode()
			}
		}

		subscribe () {
			!this._node && this._createNode()
			this._node.subscribe()
		}

		unsubscribe () {
			this._node && this._node.unsubscribe()
		}
	}
}

module.exports = plugin
