
const onChange = function (prop, value) {
	if (prop !== '_subscribed') { return }

	if (!value) {
		this.remove()
		return
	}

	if (this._isPending || this._isInProgress) { return }

	const graph = this._graph
	graph._addPending(this)
	!graph._processing
		? graph._startProcessing()
		: graph._process()
}

const autoDeps = (node, fnCalc) => {
	const usedToDepend = new Map()
	const doesNowDepend = new Set()

	const compute = () => {
		try {
			for (const edge of node.outgoing()) {
				const other = edge.target()
				usedToDepend.set(other, edge)
			}

			const value = fnCalc()

			for (const [ other, edge ] of usedToDepend.entries()) {
				if (doesNowDepend.has(other)) { continue }
				edge.remove()
			}

			if (node.outgoingNum() === 0) {
				throw Object.assign(new Error("no dependencies"), {
					atom: node._atom,
					fnCalc,
					fnCalcStr: fnCalc.toString(),
				})
			}

			return value
		} finally {
			usedToDepend.clear()
			doesNowDepend.clear()
		}
	}

	const addDependency = (other) => {
		doesNowDepend.add(other)
		if (usedToDepend.has(other)) { return }
		node.edgeTo(other)
	}

	return {
		compute,
		addDependency,
	}
}

module.exports = {
	onChange,
	autoDeps,
}
