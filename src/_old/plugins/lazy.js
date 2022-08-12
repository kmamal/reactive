const TupleMap = require('libs/tuple-map')

const plugin = (R) => {
	const core = R._core
	const logger = core._logger

	return class Lazy {
		constructor (factory, { depth } = {}) {
			this._factory = factory
			this._cache = depth === 1 ? new Map() : new TupleMap()
		}

		cachedAtom (...args) { return this._cache.get(...args) }

		getAtom (...args) {
			let atom = this.cachedAtom(...args)
			if (atom) { return atom }

			logger && logger.log("creating for", args)

			atom = this._factory(...args)
			this._cache.set(...args, atom)

			const old_handler = atom._onChange
			atom._onChange = (prop, value, old_value) => {
				if (prop === '_refcount') {
					if (value === 0) {
						logger && logger.log("destroying for", args)
						this._cache.delete(...args)
					}
				}
				else {
					old_handler.call(atom, prop, value, old_value)
				}
			}

			return atom
		}
	}
}

module.exports = plugin
