var express = require('express'),
    app = express(),
    pg = require('pg'),
    bodyParser = require('body-parser');

var connectionString = 'postgres://viewer:123@localhost/pwnsong';
    client = new pg.Client(connectionString);
client.connect();

app.use("/", express.static(__dirname + "/../frontEnd"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/api/v1/planet/:planetName", function(req, res) {
    var planetName = req.params.planetName,
        query = client.query("SELECT id, name, description "
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

app.get("/api/v1/system/:systemName", function(req, res) {
    var systemName = req.params.systemName,
        query = client.query("SELECT s.id, s.name, s.description, array_to_string(array_agg(p.name), ',') as planets "
                           + "FROM Systems s "
                           + "  JOIN Planets p ON s.id = p.systemId "
                           + "WHERE LOWER(s.name) = LOWER('" + systemName + "') "
                           + "GROUP BY s.id");
        results = [];

    query.on('row', function(row) {
        results.push(row);
    });
    query.on('end', function() {
        res.send(results[0]);
        res.end();
    });
});

app.get("/api/v1/planet/:planetName/comments", function(req, res) {
    var planetName = req.params.planetName,
        query = client.query("SELECT c.id, c.playerId, c.text, c.isGmComment, pl.characterName "
                           + "FROM Planets p "
                           + "JOIN PlanetsComments pc "
                           + "  ON p.id = pc.planetsId "
                           + "JOIN Comments c "
                           + "  ON pc.commentsId = c.id "
                           + "JOIN Players pl "
                           + "  ON c.playerId = pl.id "
                           + "WHERE LOWER(p.name) = LOWER('" + planetName + "')"
                           + "  AND c.deleted = false");
        results = [];
    // TODO: make these use promises.
    query.on('row', function(row) {
        results.push(row);
    });
    query.on('end', function() {
        res.send(results);
        res.end();
    });
});

app.post("/api/v1/planet/:planetId/comment", function(req, res) {
    var planetId = req.params.planetId,
        playerId = req.body.playerId,
        commentText = req.body.commentText,
        isGmComment = req.body.isGmComment || false,
        query = client.query("INSERT INTO Comments "
                           + "(playerId, text, isGmComment) VALUES "
                           + "(" + playerId + ", '" + commentText + "', " + isGmComment + ")"
                           + "RETURNING id");
    query.on('row', function(row) {
        console.log("--" , row);
        var sql = "INSERT INTO PlanetsComments "
                   + "(planetsId, commentsId) VALUES "
                   + "(" + planetId + "," + row.id + ")"
        console.log(sql);
        query2 = client.query(sql);
    });
    res.end();
});

/// I think I remember something about DELETE not having a request body in express.
app.post("/api/v1/planet/comment", function(req, res) {
    console.log(req.body);
    var commentId = req.body.id,
        sql = "UPDATE Comments SET deleted = true WHERE id = " + commentId;
    console.log(sql);
        query = client.query(sql);
    res.end();
});

app.listen(5050);
