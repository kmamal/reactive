
const SetImpl = Set

const plugin = (R) => class Set {
	constructor (init) {
		this._set = new SetImpl(init)
		this._items = new R.Lazy(() => new R.Atom(), { depth: 1 })

		this._size = new R.Value(this._set.size)
		this._has = new R.Lazy((x) => new R.Calc(() => {
			this._items.getAtom(x).accessed()
			return this._set.has(x)
		}), { depth: 1 })
	}

	get size () { return this._size.get() }
	has (x) { return this._has.getAtom(x).get() }

	_do (method, x) {
		const old_size = this._set.size
		const ret = this._set[method](x)
		const new_size = this._set.size

		triggering: {
			const changed = new_size !== old_size
			if (!changed) { break triggering }
			this._size.set(new_size)

			const atom = this._items.cachedAtom(x)
			atom && atom.changed()
		}

		return ret
	}

	add (x) { return this._do('add', x) }
	delete (x) { return this._do('delete', x) }
}

module.exports = plugin
