var midi = require('midi')
var Emitter = require('wildemitter')

module.exports = Korg

function Korg () {
  this.scene = 1

  this.input = this.createInput()

  this.input.on('message', this.handleMessage.bind(this))

  Emitter.call(this)
  return this
}

Korg.prototype = new Emitter

Korg.prototype.handleMessage = function(delta, raw) {
  var msg = this.parseMessage(raw)

  if (msg.scene) {
    this.scene = msg.scene
    return this.emit('scene', msg.scene)
  }

  if (msg.control >= 14 && msg.control <= 22) {
    n = msg.control - 13
    return this.emit('knob:'+n, msg.value)
  }

  if (msg.control >= 2 && msg.control <= 13) {
    n = msg.control - 1
    return this.emit('slider:'+n, msg.value)
  }

  if (msg.control >= 23 && msg.control <= 31) {
    n = msg.control - 22
    return this.emit('button:'+n, msg.value)
  }

  if (msg.control >= 33 && msg.control <= 41) {
    n = msg.control - 23
    return this.emit('button:'+n, msg.value)
  }

  if (msg.control === 47) {
    return this.emit('button:prev', msg.value)
  }

  if (msg.control === 45) {
    return this.emit('button:play', msg.value)
  }

  if (msg.control === 48) {
    return this.emit('button:next', msg.value)
  }

  if (msg.control === 49) {
    return this.emit('button:loop', msg.value)
  }

  if (msg.control === 46) {
    return this.emit('button:stop', msg.value)
  }

  if (msg.control === 44) {
    return this.emit('button:record', msg.value)
  }
}

Korg.prototype.parseMessage = function(raw) {
  if (raw[0] === 240) {
    var message = {
      scene: raw[9] + 1
    }
  } else {
    var message = {
      control: raw[1],
      value: raw[2]/127
    }
  }

  return message
}

Korg.prototype.createInput = function() {
  var input = new midi.input()

  var portCount = input.getPortCount()
  for (var i = 0; i <= portCount; i++) {
    var name = input.getPortName(i)
    if (name.match(/nanoKONTROL SLIDER\/KNOB/)) {
      input.openPort(i)
      break
    }
  }

  input.ignoreTypes(false, false, false)

  return input
}

Korg.prototype.close = function() {
  this.input.closePort()
}
