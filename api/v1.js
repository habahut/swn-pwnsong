var express = require('express'),
    app = express(),
    pg = require('pg');

var connectionString = 'postgres://viewer:123@localhost/pwnsong';
    client = new pg.Client(connectionString);
client.connect();

app.use("/", express.static(__dirname + "/../frontEnd"));

app.get("/api/v1/planet/:planetName", function(req, res) {
    var planetName = req.params.planetName,
        query = client.query("SELECT name, description "
                           + "FROM Planets "
                           + "WHERE LOWER(name) = LOWER('" + planetName + "');"),
        results = [];
    query.on('row', function(row) {
        results.push(row);
    });
    query.on('end', function() {
        res.send(results[0]);
        res.end();
    });
});

app.listen(5050);
