
class Item {
  constructor (value, calcNext) {
    this._value = value
    this._next = next
  }

  value () { return this._value.get() }
  next () { return this._next.get() }
}

class Sequence {
  constructor (makeValue, makeNext) {
    this._values = new R.Lazy(makeValue, { depth: 1 })
    this._nexts = new R.Lazy(makeNext, { depth: 1 })
  }

  makeItem (item) {
    return new Item(this._values.get(item), this.makeItem(this._nexts.get(item)))
  }

  first () {
    return new Item
  }
}

const plugin = (R) => {
  //

  return

  const Mapping = (op) => new Sequence(
    (item) => new R.Calc(() => op(item.value().get())),
    (item) => new R.Calc(() => item.next()),
  )

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
}


(a 1 -> (b 3 -> (c 6 -> null)))

(aa 2 -> (bb 6 -> (cc 12 -> null)))

(a 1 -> (b 3 -> (x 5 -> (c 6 -> null))))

(aa 2 -> (bb 6 -> (xx 10 -> (cc 12 -> null))))
