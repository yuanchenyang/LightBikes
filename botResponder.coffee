program = require("commander")

json = (val) ->
  JSON.parse(val)

program
  .option('-b, --bot [filename]', "The bot's filename", false)
  .parse(process.argv)


name = null
fun = ->

sandbox =
  Bot:
    register: (_name, _fun) ->
      name = _name
      fun = _fun
  mathjs: require('mathjs')
  _: require('underscore')
  $: require('jquery')
  console:
    log: ->
    error: ->
    warn: ->

vm = require('vm')
fs = require('fs')

vm.runInNewContext(fs.readFileSync(program.bot).toString(), sandbox)

# Bot is loaded!
net = require('net')

net.socket.connect("/tmp/LightBikeBot-#{name}", (conn) ->
  socket.setEncoding("utf8")
  conn.on('data', (d) ->
    d.split("\n")
  )
)


fun(program.state, program.player, (move) ->
  console.log(JSON.stringify(program.player))
  process.exit(move)
)
