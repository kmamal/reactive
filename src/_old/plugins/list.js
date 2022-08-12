
const plugin = (R) => {
	class ListItem {
		constructor (value, prev, next) {
			this._value = new R.Value(value)
			this._prev = new R.Value(prev)
			this._next = new R.Value(next)
		}

		value () { return this._value.get() }

		prev () { return this._prev.get() }

		next () { return this._next.get() }
	}

	return class List {
		constructor (init) {
			this._first = new R.Value(null)
			this._last = new R.Value(null)

			for (const x of init.values()) {
				this.append(x)
			}
		}

		append (x) {
			const last = this._last.peek()
			const item = new ListItem(x, last, null)
			const prev = last ? last._prev : this._first
			prev.set(item)
			this._last.set(item)
		}

		prepend (x) {
			const first = this._first.peek()
			const item = new ListItem(x, null, first)
			const next = first ? first._prev : this._last
			next.set(item)
			this._first.set(item)
		}

		removeItem (item) {
			const _prev = item._prev.peek()
			const _next = item._next.peek()
			item._prev.set(null)
			item._next.set(null)
			const prev = _prev ? prev._next : this._first
			const next = _next ? _next._prev : this._last
			prev.set(next)
			next.set(prev)
		}

		insertBefore (other, x) {
			const _prev = other._prev.peek()
			const item = new ListItem(x, _prev, other)
			other._prev.set(item)
			const prev = _prev ? prev._next : this._first
			prev.set(item)
		}

		insertAfter (other, x) {
			const _next = item._next.peek()
			const item = new ListItem(x, other, _next)
			other._next.set(item)
			const next = _next ? _next._prev : this._last
			next.set(item)
		}

		map (op) {
			return new R.Mapping(op)
		}

		filter (op) {
			//
		}

		reduce (op, acc) {
			//
		}

		tap (op) {
			//
		}
	}
}

module.exports = plugin
