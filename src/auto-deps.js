
const onChange = function (prop, value) {
	if (prop !== '_subscribed') { return }

	if (value) {
		const graph = this._graph

		if (false
			|| graph._pendingSet.has(this)
			|| graph._inProgress.includes(this)
		) { return }

		graph._pending.push(this)
		graph._pendingSet.add(this)

		!graph._processing
			? graph._startProcessing()
			: graph._process()
	} else {
		this._node.remove()
	}
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
				throw new Error("no dependencies")
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
