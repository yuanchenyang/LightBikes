require('shelljs/global')

global.window = global
global._ = require('lodash-node')

require('./public/js/hex')
require('./public/js/player')
require('./public/js/bot')
require('./public/js/board')
require('./public/js/game')

Http    = require('http')
Https   = require('https')
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
  "-4":
    name: "LessDumbBot",
    file: "./example-bots/less-dumb-bot.js"
  "-5":
    name: "AvoidBot",
    file: "./example-bots/avoid-bot.js"
  "-6":
    name: "SpiralBot",
    file: "./example-bots/spiral-bot.js"
  "-7":
    name: "FollowBot",
    file: "./example-bots/follow-bot.js"
  "-8":
    name: "FleeBot",
    file: "./example-bots/flee-bot.js"

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
  f = p.file.replace(/"/g, "\\\"")
  n = p.name.replace(/"/g, "\\\"")
  "coffee botResponder.coffee --bot \"#{f}\" --name \"#{n}\""

run_match = (p1, p2, callback) ->
  p1.state = {}
  p2.state = {}

  say('match', "#{p1.name} vs. #{p2.name}")

  g = new Game([p1.name, p2.name], true)
  g.run((result) ->
    p1.score += result[0]
    p2.score += result[1]

    if (result[0] == 0.5)
      say("results", "#{p1.name} tied with #{p2.name}")
    else if (result[0] == 1)
      say("results", "#{p1.name} vanquished #{p2.name}")
    else if (result[1] == 1)
      say("results", "#{p1.name} was vanquished by #{p2.name}")
    else
      say("results", "nobody wins!")
    callback()
  )

Models.Team.findAll()
.then((teams) ->
  Q.all(_.map(teams, (team) ->
    say('init', "#{team.name} -> #{team.gh_uname}/#{team.gh_repo}")
    PARTICIPANTS[team.id] =
      name: team.name
      repo: team.gh_uname + "/" + team.gh_repo
      url: "https://github.com/#{team.gh_uname}/#{team.gh_repo}"

    def = Q.defer()

    url = "https://rawgit.com/#{team.gh_uname}/#{team.gh_repo}/master/entry.js"
    console.log(url)
    fname = "./user-bots/#{team.name}.js"
    Https.get(url, (res) ->
      console.log(res.statusCode)
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
    p.score = 0

    cmd = get_cmd(p)
    console.log("Starting: #{cmd}")
    p.proc = exec(cmd + " 2>&1", {async: true})

    Bot.register(p.name, (game_state, player_state, move) ->
      if (p.strikes < 3)
        buf = ""

        timeout = null

        soc = "/tmp/LightBikeBot-#{p.name}"
        c = net.createConnection(soc)

        c.on('connect', () ->
          c.write(JSON.stringify(game_state) + "\n")
          c.write(JSON.stringify(player_state) + "\n")
        )

        c.on('data', (d) ->
          buf += d
        )

        c.on('end', (d) ->
          parts = buf.split("\n")
          _.extend(player_state, JSON.parse(parts[0] || "{}"))
          move(JSON.parse(parts[1] || "{}").move)
          clearTimeout(timeout)
        )

        c.on('error', ->
          console.log("Socket error connecting to #{p.name}")
          clearTimeout(timeout)
          p.strikes += 1
          move()
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
  say('play', "Matches #{MATCHES.length * 2}")

  say('play', "Waiting for processes to settle")

  def = Q.defer()

  d = _.after(MATCHES.length * 2, () ->
    def.resolve()
  )

  setTimeout(() ->
    say('play', "Starting all matches")
    _.each(MATCHES, (match) ->
      p1 = PARTICIPANTS[match[0]]
      p2 = PARTICIPANTS[match[1]]

      run_match(p1, p2, d)
    )

    _.each(MATCHES, (match) ->
      p1 = PARTICIPANTS[match[1]]
      p2 = PARTICIPANTS[match[0]]

      run_match(p1, p2, d)
    )
  , 10000)

  def.promise
).then(() ->
  winners = _.chain(PARTICIPANTS)
             .each((p) -> p.proc.kill('SIGKILL') )
             .sortBy((p) -> -p.score)
             .map((p) -> [p.name, p.score, p.url || p.file])
             .value()
  console.log()
  console.log()

  console.log("Results:")
  _.each(winners, (w) ->
    console.log("#{w[0]} won #{w[1]} matches (#{w[2]})")
  )

  process.exit(0)
)
