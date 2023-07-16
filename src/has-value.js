const { isEqual } = require('@kmamal/util/object/is-equal')

class HasValue {
	constructor (value = null, fnEq = isEqual) {
		this._value = value
		this._fnEq = fnEq
	}

	get () {
		this._node.triggerObserve()
		return this._value
	}

	peek () { return this._value }

	set (value) {
		if (this._fnEq(value, this._value)) { return }
		this._value = value
		this._node.triggerChange()
	}
}

module.exports = { HasValue }
