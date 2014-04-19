program = require("commander")

json = (val) ->
  JSON.parse(val)

program
  .option('-b, --bot [filename]', "The bot's filename", false)
  .option('-s, --state [board_state]', "The board state", json, {})
  .option('-p, --player [players_state]', "The player's state", json, {})
  .parse(process.argv)


name = null
fun = ->

sandbox =
  Bot:
    register: (_name, _fun) ->
      name = _name
      fun = _fun
  mathjs: require('mathjs')
  _: require('lodash-node')
  $: require('jquery')
  console:
    log: ->
    error: ->
    warn: ->

vm = require('vm')
fs = require('fs')

vm.runInNewContext(fs.readFileSync(program.bot).toString(), sandbox)

fun(program.state, program.player, (move) ->
  console.log(JSON.stringify(program.player))
  process.exit(move)
)
