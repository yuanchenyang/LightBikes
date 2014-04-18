db = require('./db')
Models = require('./Models')
Q = require('Q')
_ = require('underscore')
Http = require('http')
fs = require('fs')

console.log("Loading participants...")

PARTICIPANTS =
  "-1":
    name: "DumbBot",
    file: "./example-bots/dumb-bot.js"
  "-2":
    name: "CircleBot",
    file: "./example-bots/circle-bot.js"

Models.Team.findAll()
.then((teams) ->
  Q.all(_.map(teams, (team) ->
    console.log(team.name + " -> " + team.repo)
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
        console.log("#{team.name} failed to submit good")
        dummy_file = "Bot.register('#{team.name}', function(){});"
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
  console.log(PARTICIPANTS)
)
