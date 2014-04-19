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

max_execs = 30
running_execs = 0
waiting_execs = []

run_next = (command, props, callback) ->
  running_execs += 1

  timeout = null

  proc = exec(command, props, ->
    running_execs -= 1
    clearTimeout(timeout)
    if (waiting_execs.length > 0)
      say("run", "Waiting execs: #{waiting_execs.length}")
      enqueue_exec.apply(null, waiting_execs.pop())
    callback.apply(null, arguments)
  )

  timeout = setTimeout(() ->
    say('bot', "Killing slow exec #{command}")
    proc.kill('SIGKILL')
  , 1000)

enqueue_exec = (command, props, callback) ->
  if (running_execs < max_execs)
    run_next(command, props, callback)
  else
    waiting_execs.push([command, props, callback])

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
  "coffee getResponse.coffee --bot '#{p.file}'
                             --player '#{JSON.stringify(player_state)}'
                             --state '#{JSON.stringify(game_state)}'"

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
    p.strikes = 0
    Bot.register(p.name, (game_state, player_state, move) ->
      if (p.strikes < 3)
        move_cmd = get_cmd(p, game_state, player_state)

        enqueue_exec(move_cmd, {silent: true}, (code, output) ->
          if code == null
            p.strikes++
            say('bot', "#{p.name} Strike #{p.strikes}")
          say('bot', "#{p.name} -> #{code}")
          _.extend(player_state, JSON.parse(output || "{}"))
          move(code)
        )
      else
        say('bot', "Skipping repeat offender #{p.name}")
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

  say('play', "Starting all matches")
  _.each(MATCHES, (match) ->
    p1 = PARTICIPANTS[match[0]]
    p2 = PARTICIPANTS[match[1]]

    run_match(p1, p2)
  )
)
