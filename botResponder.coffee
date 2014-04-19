require("shelljs/global")
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
  _: require('lodash-node')
  $: require('jquery')
  console:
    log: ->
    error: ->
    warn: ->

vm = require('vm')
fs = require('fs')

vm.runInNewContext(fs.readFileSync(program.bot).toString(), sandbox)

sock = null

# Bot is loaded!
request = (sock, board_state, player_state) ->
  fun(board_state, player_state, (move) ->
    sock.write(JSON.stringify(player_state) + "\n")
    sock.write(JSON.stringify({move: move}) + "\n")
    sock.end()
  )


net = require('net')

s = net.createServer((conn) ->
  buf = ""
  conn.setEncoding("utf8")
  conn.on('data', (d) ->
    buf += d
    rows = buf.split("\n")
    if rows.length >= 2
      resp = rows[0..1]
      if (resp[0] != "" && resp[1] != "")
        request(conn, JSON.parse(resp[0]), JSON.parse(resp[1]))
        rows = rows[2..]
    buf = rows.join("\n")
  )
)

bname = "/tmp/LightBikeBot-#{name}"

exec("rm -rf #{bname}", () ->
  s.listen(bname)
)
