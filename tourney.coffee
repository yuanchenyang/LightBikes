require('shelljs/global')
require('./public/js/bot')

Http    = require('http')
Q       = require('Q')
_       = require('underscore')
fs      = require('fs')

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

get_cmd = (p, game_state) ->
  "coffee getResponse.coffee --bot '#{p.file}'
                             --player '#{JSON.stringify(p.state)}'
                             --state '#{JSON.stringify(game_state)}'"

run_match = (p1, p2) ->
  p1.state = {}
  p2.state = {}

  say('match', "#{p1.name} vs. #{p2.name}")

  g = new Game([p1.name, p2.name], true)
  g.run((result) ->
    console.log(result)
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
        console.log(res.statusCode)
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
    Bot.register(p.name, (game_state, player_state, move) ->
      move_cmd = get_cmd(p, game_state)

      timeout = null

      proc = exec(move_cmd, {silent: true}, (code, output) ->
        if (code != null)
          say('bot', "#{p.name} -> #{code}")
          _.extend(player_state, JSON.parse(output || "{}"))
          clearTimeout(timeout)
          move(code)
      )

      timeout = setTimeout(() ->
        say('bot', "Killing slow player #{p.name}")
        proc.kill('SIGKILL')
        move()
      , 1000)
    )
  )

  say('play', "Computing matches")
  MATCHES = _.flatten(_.map(keys, (key1, i) ->
    _.map(keys[(i+1)..], (key2) ->
      [key1, key2]
    )
  ), true)
  say('play', "Matches #{MATCHES.length}")

  say('play', "Starting all matches")
  _.each(MATCHES, (match) ->
    p1 = PARTICIPANTS[match[0]]
    p2 = PARTICIPANTS[match[1]]

    run_match(p1, p2)
  )
)
