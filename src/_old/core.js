const DependencyGraph = require('./graph')

class Core {
	constructor ({ graph, logger } = {}) {
		this._graph = new DependencyGraph(graph)

		this._calc_stack = []
		this._pending = new Set()
		this._when_done = null
		this._logger = logger
	}

	accessed (atom) {
		if (!this._isCalculating()) { return }

		const [ calc ] = this._calc_stack
		!atom._node && atom._createNode()

		const logger = this._logger
		logger && logger.group("accessed", atom._node.toString())

		atom._node.edgeTo(calc._node)

		logger && logger.groupEnd()
	}

	async calculate (calc) {
		const logger = this._logger
		logger && logger.group("calculating", calc._node.toString())

		this._calc_stack.unshift(calc)

		const used_to_depend = new Set(calc._node.incoming().values())

		let result
		try {
			result = await calc._calc()
		}
		catch (error) {
			console.error(error)
		}

		for (const edge of calc._node.incoming().values()) {
			used_to_depend.delete(edge)
		}

		for (const edge of used_to_depend) {
			edge.remove()
		}

		logger && logger.groupEnd()

		calc.set(result)

		const entry = this._calc_stack.shift()
		if (!entry) { throw new Error(`Nothing was recording`) }
		if (entry !== calc) { throw new Error(`Computed '${calc}' was not on top of the stack`) }
	}

	async changed (atom) {
		if (!atom._node) { return }

		const logger = this._logger
		logger && logger.group("changed", atom._node.toString())

		const children = atom._node.children()

		for (const node of children.values()) {
			this._pending.add(node._atom)
		}

		if (!this._when_done) {
			this._when_done = this._startCalculating()
		}
		await this._when_done
		this._when_done = null

		logger && logger.groupEnd()
	}

	async _startCalculating () {
		while (this._pending.size) {
			let calc
			let min_order = Infinity
			for (const atom of this._pending.values()) {
				const order = atom._node._order
				if (order < min_order) {
					min_order = order
					calc = atom
				}
			}

			await this.calculate(calc)
			this._pending.delete(calc)
		}
	}

	_isCalculating () { return this._calc_stack.length > 0 }

	whenDone () { return this._when_done }
}

module.exports = Core
