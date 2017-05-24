
import MetricsSender from 'sender'
import MetricsExecutor from 'executor'

export default class MetricsBuilder {
  static set dimensions(dimensions) {
    this._dimensions = Object.keys(dimensions)
      .map((dimensionName) => ({ Name: dimensionName, Value: dimensions[dimensionName] }))
  }

  static get dimensions() {
    return this._dimensions || []
  }

  constructor(...args) {
    this.objects = []
    this.dimensions = this.constructor.dimensions

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      // If the first argument is a string, it's the metric name
      if (i === 0 && typeof arg === 'string')
        this.name = arg

      // If the last argument is a function, it's the code
      else if (i === args.length-1 && typeof arg === 'function')
        this._run(arg) // bug, we have no way to return a value here

      // Otherwise it's an object we need to proxy
      else
        this.objects.push(arg)
    }
  }

  named(name) {
    this.name = name
    return this
  }

  with(...objects) {
    this.objects = objects
    return this
  }

  // Only intended for use with wrap(). Not a public API.
  _recursive() {
    this.recursive = true
    return this
  }

  execute(block) {
    return new MetricsExecutor(this).run(block)
  }

  count(value) {
    if (!this.name)
      throw 'Metric name required'

    MetricsSender.queue({
      Dimensions: this.dimensions,
      MetricName: this.name,
      Unit: 'Count',
      Timestamp: new Date(),
      Value: value
    })
  }
}
