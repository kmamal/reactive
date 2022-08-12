
const plugin = (R) => class Value extends R.Atom {
	constructor (init) {
		super()
		this._value = init
	}

	get () {
		this.accessed()
		return this._value
	}

	peek () {
		return this._value
	}

	async set (value) {
		if (this._isEqual(value)) { return }

		this._value = value
		await this.changed()
	}

	_isEqual (value) { return this._value === value }
}

module.exports = plugin
