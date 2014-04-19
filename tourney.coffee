require('shelljs/global')

global.window = global
global._ = require('underscore')

require('./public/js/player')
require('./public/js/bot')
require('./public/js/board')
require('./public/js/game')

Http    = require('http')
Q       = require('Q')
fs      = require('fs')
net     = require('net')

db      = require('./db')
Models  = require('./Models')


console.log("Loading participants...")

PARTICIPANTS =
  "-1":
    name: "DumbBot",
    file: "./example-bots/dumb-bot.js"
  "-2":
    name: "CircleBot",
    file: "./example-bots/circle-bot.js"
  "-3":
    name: "SlowBot",
    file: "./example-bots/slow-bot.js"

MATCHES = []

say = (category, message) ->
  m = category.toUpperCase()
  before = true
  for i in [0..(10-category.length)]
    if before
      m = " " + m
    else
      m += " "
    before = !before
  console.log("*** #{m} ***: #{message}")

get_cmd = (p, game_state, player_state) ->
  "coffee botResponder.coffee --bot '#{p.file}'"

run_match = (p1, p2) ->
  p1.state = {}
  p2.state = {}

  say('match', "#{p1.name} vs. #{p2.name}")

  g = new Game([p1.name, p2.name], true)
  g.run((result) ->
    say('match complete', JSON.stringify(result))
  )

Models.Team.findAll()
.then((teams) ->
  Q.all(_.map(teams, (team) ->
    say('init', "#{team.name} -> #{team.repo}")
    PARTICIPANTS[team.id] =
      name: team.name
      repo: team.repo

    def = Q.defer()

    url = "http://raw.githubusercontent.com/#{team.repo}/master/entry.js"
    fname = "./user-bots/#{team.name}.js"
    Http.get(url, (res) ->
      if (res.statusCode == 200)
        res.setEncoding('utf8')
        data = ""
        res.on("data", (chunk) ->
          data += chunk
        )

        res.on("end", () ->
          fs.writeFile(fname, data, (err) ->
            if (err)
              console.log(err)
            PARTICIPANTS[team.id].file = fname
            def.resolve()
          )
        )
      else
        say('init', "#{team.name} failed to submit good")
        dummy_file = "Bot.register('#{team.name}', function(a, b, c){c();});"
        fs.writeFile(fname, dummy_file, (err) ->
          if (err)
            console.log(err)
          PARTICIPANTS[team.id].file = fname

          def.resolve()
        )
    )

    def.promise
  ))
)
.then(() ->
  say('init', "Participants loaded!")
  keys = _.keys(PARTICIPANTS)

  _.each(PARTICIPANTS, (p) ->
    p.strikes = 0

    cmd = get_cmd(p)
    proc = exec(cmd, {silent: true, async: true})

    Bot.register(p.name, (game_state, player_state, move) ->
      if (p.strikes < 3)
        buf = ""

        timeout = null

        c = net.createConnection("/tmp/LightBikeBot-#{p.name}")

        c.on('connect', () ->
          c.write(JSON.stringify(game_state) + "\n")
          c.write(JSON.stringify(player_state) + "\n")
        )

        c.on('data', (d) ->
          buf += d
        )

        c.on('end', (d) ->
          parts = buf.split("\n")
          _.extend(player_state, JSON.parse(parts[0] || {}))
          move(JSON.parse(parts[1]).move)
          clearTimeout(timeout)
        )

        timeout = setTimeout(() ->
          c.end()
          p.strikes += 1
          move()
        , 1000)

      else
        move()
    )
  )

  say('play', "Computing matches")
  MATCHES = _.flatten(_.map(keys, (key1, i) ->
    _.map(keys[(i+1)..], (key2) ->
      [key1, key2]
    )
  ), true)
  say('play', "Matches #{MATCHES.length}")

  say('play', "Waiting for processes to settle")

  setTimeout(() ->
    say('play', "Starting all matches")
    _.each(MATCHES, (match) ->
      p1 = PARTICIPANTS[match[0]]
      p2 = PARTICIPANTS[match[1]]

      run_match(p1, p2)
    )
  , 1000)
)
