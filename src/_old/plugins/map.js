
const MapImpl = Map

const plugin = (R) => class Map {
	constructor (init) {
		this._map = new MapImpl(init)
		this._keys = new R.Lazy(() => new R.Atom(), { depth: 1 })
		this._values = new R.Lazy(() => new R.Atom(), { depth: 1 })

		this._size = new R.Value(this._map.size)
		this._has = new R.Lazy((x) => new R.Calc(() => {
			this._keys.getAtom(x).accessed()
			return this._map.has(x)
		}), { depth: 1 })
		this._get = new R.Lazy((x) => new R.Calc(() => {
			this._values.getAtom(x).accessed()
			return this._map.get(x)
		}), { depth: 1 })
	}

	get size () { return this._size.get() }
	has (k) { return this._has.getAtom(k).get() }
	get (k) { return this._get.getAtom(k).get() }

	_do (method, k, v) {
		const old_size = this._map.size
		const ret = this._map[method](k, v)
		const new_size = this._map.size

		triggering_keys: {
			const size_changed = new_size !== old_size
			if (!size_changed) { break triggering_keys }
			this._size.set(new_size)

			const atom = this._keys.cachedAtom(k)
			atom && atom.changed()
		}

		const atom = this._values.cachedAtom(k)
		atom && atom.changed()

		return ret
	}

	set (k, v) { return this._do('set', k, v) }
	delete (k) { return this._do('delete', k) }
}

module.exports = plugin
