const Core = require('./core')
const atom = require('./atom')
const value = require('./value')
const calc = require('./calc')

class Reactor {
	constructor (options) {
		this._core = new Core(options)

		this
			.use(atom)
			.use(value)
			.use(calc)

		this.Atom.prototype._Node = this._core._graph.SourceNode
		this.Value.prototype._Node = this._core._graph.SourceNode
		this.Calc.prototype._Node = this._core._graph.Node
	}

	use (factory) {
		const Plugin = factory(this)
		this[Plugin.name] = class extends Plugin {}
		this[Plugin.name].prototype._reactor = this
		this[Plugin.name].prototype._core = this._core
		return this
	}
}

module.exports = Reactor
