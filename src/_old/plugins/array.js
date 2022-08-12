
const ArrayImpl = Array

const plugin = (R) => class Array {
	constructor (init) {
		this._array = ArrayImpl.from(init)
		this._items = new R.Lazy(() => new R.Atom(), { depth: 1 })

		this._length = new R.Value(this._array.length)
		this._nth = new R.Lazy((n) => new R.Calc(() => {
			this._items.getAtom(n).accessed()
			return this._array[n]
		}), { depth: 1 })
	}

	get length () { return this._length.get() }
	nth (n) { return this._nth.getAtom(n).get() }

	splice (n, r, ...items) {
		const old_length = this._array.length
		const ret = this._array.splice(n, r, ...items)
		const new_length = this._array.length

		const length_changed = new_length !== old_length
		let end
		if (length_changed) {
			this._length.set(new_length)
			end = Math.max(old_length, new_length)
		}
		else {
			end = n + items.length
		}

		for (let i = n; i < end; i++) {
			const atom = this._items.cachedAtom(i)
			atom && atom.changed()
		}

		return ret
	}

	unshift (x) {
		this.splice(0, 0, x)
		return this._array.length
	}
	push (x) {
		this.splice(this._array.length, 0, x)
		return this._array.length
	}
	shift () { return this.splice(0, 1)[0] }
	pop () { return this.splice(this._array.length - 1, 1)[0] }

	sort (compare) {
		const indexed = ArrayImpl.from(this._array, (x, i) => [ x, i ])
		indexed.sort(compare)
		this._array = Array.from(indexed, ([ x, old_i ], i) => {
			triggering: {
				const moved = i !== old_i
				if (!moved) { break triggering }

				const atom = this._items.cachedAtom(i)
				atom && atom.changed()
			}

			return x
		})
		return this
	}
}

module.exports = plugin
