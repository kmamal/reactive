
const plugin = (R) => {
  //

	const byOp = new WeakMap()

	return class Mapping {
		constructor (op) {
			let mapping = byOp.get(op)
			if (mapping) {
				return mapping
			}

			mapping = new R.Sequence(
        (item) => new R.Calc(() => op(item.value().get())),
        (item) => new R.Calc(() => item.next()),
      )
			byOp.set(op, mapping)
			return mapping
		}
  }
}

module.exports = plugin


const Filtering = (op) => new Sequence(
    (item) => item,
    (item) => new R.Calc(() => {
	do {
		item = item.next()
	} while (!op(item.value().get()))
	return item
}),
  )

const Iterating = (op) => new R.Calc(() => {
    // ???
})

const Reducing = (op, acc) => new R.Calc(() => {
	let item = seq.first()

	if (acc === undefined) {
		if (!item) {
			throw new Error("too few elements")
		}

		const next = item.next()
		if (!next) { return item.value().get() }

		acc = op(item.value().get(), next.value().get())
		item = next
	}

	while (item) {
		acc = op(acc, item.value().get())
	}
	return acc
})
