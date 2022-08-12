const { isEqual } = require('@kmamal/util/object/is-equal')

class HasValue {
	constructor (value = null) {
		this._value = value
	}

	get () {
		this._node.triggerObserve()
		return this._value
	}

	peek () { return this._value }

	set (value) {
		if (isEqual(value, this._value)) { return }
		this._value = value
		this._node.triggerChange()
	}
}

module.exports = { HasValue }
