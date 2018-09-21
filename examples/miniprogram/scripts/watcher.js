let id = 0

class Watch {
  constructor (func) {
    id += 1
    this.id = id
    this.func = func
  }
  excute () {
    this.func()
  }
}

module.exports = Watch
