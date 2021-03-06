var express = require('express'),
    app = express(),
    pg = require('pg'),
    bodyParser = require('body-parser');


var connectionString = process.env.DATABASE_URL || 'postgres://viewer:123@localhost/pwnsong',
    port = process.env.PORT || 5050;
var client = new pg.Client(connectionString);
client.connect();

app.use("/", express.static(__dirname + "/frontEnd"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/api/v1/players", function(req, res) {
    var query = client.query("SELECT * FROM Players"),
        results = [];
    query.on('row', function(row) {
        results.push(row);
    });
    query.on('end', function() {
        res.send(results);
        res.end();
    });
});

app.get("/api/v1/systems", function(req, res) {
    var query = client.query("SELECT * FROM Systems"),
        results = [];
    query.on('row', function(row) {
        results.push(row);
    });
    query.on('end', function() {
        res.send(results);
        res.end();
    });
});

app.get("/api/v1/planet/:planetName", function(req, res) {
    var planetName = req.params.planetName,
        sql = "SELECT p.id, p.name, p.description, p.visible, s.name as systemName, s.id as systemId "
            + "FROM Planets p "
            + "JOIN Systems s "
            + "  ON s.id = p.systemId "
            + "WHERE LOWER(p.name) = LOWER('" + planetName + "')"
        query = client.query(sql),
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
        sql = "SELECT s.id, s.name, s.description, s.visible, array_to_string(array_agg(p.name), ',') as planets "
            + "FROM Systems s "
            + "  JOIN Planets p ON s.id = p.systemId "
            + "WHERE LOWER(s.name) = LOWER('" + systemName + "') "
            + "GROUP BY s.id";
        query = client.query(sql);
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
        sql = "SELECT c.id, c.playerId, c.text, c.isGmComment, pl.characterName "
            + "FROM Planets p "
            + "JOIN PlanetsComments pc "
            + "  ON p.id = pc.planetsId "
            + "JOIN Comments c "
            + "  ON pc.commentsId = c.id "
            + "JOIN Players pl "
            + "  ON c.playerId = pl.id "
            + "WHERE LOWER(p.name) = LOWER('" + planetName + "')"
            + "  AND c.deleted = false "
            + "ORDER BY id",
        query = client.query(sql);

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
        var sql = "INSERT INTO PlanetsComments "
                   + "(planetsId, commentsId) VALUES "
                   + "(" + planetId + "," + row.id + ")"
        query2 = client.query(sql);
        query2.on('end', function() {
            res.end();
        });
    });
});

/// I think I remember something about DELETE not having a request body in express.
app.post("/api/v1/delete/planet/comment", function(req, res) { 
    var commentId = req.body.id,
        sql = "UPDATE Comments SET deleted = true WHERE id = " + commentId;
        query = client.query(sql);
    res.end();
});

/// This is stupid copy and paste. Will come up with some thing more elegant
// when switching to firebase
app.get("/api/v1/system/:systemName/comments", function(req, res) {
    var systemName = req.params.systemName,
        sql = "SELECT c.id, c.playerId, c.text, c.isGmComment, pl.characterName "
            + "FROM Systems s "
            + "JOIN SystemsComments sc "
            + "  ON s.id = sc.systemsId "
            + "JOIN Comments c "
            + "  ON sc.commentsId = c.id "
            + "JOIN Players pl "
            + "  ON c.playerId = pl.id "
            + "WHERE LOWER(s.name) = LOWER('" + systemName + "')"
            + "  AND c.deleted = false "
            + "ORDER BY c.id";
        query = client.query(sql);
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

app.post("/api/v1/system/:systemId/comment", function(req, res) {
    var systemId = req.params.systemId,
        playerId = req.body.playerId,
        commentText = req.body.commentText,
        isGmComment = req.body.isGmComment || false,
        query = client.query("INSERT INTO Comments "
                           + "(playerId, text, isGmComment) VALUES "
                           + "(" + playerId + ", '" + commentText + "', " + isGmComment + ")"
                           + "RETURNING id");
    query.on('row', function(row) {
        var sql = "INSERT INTO SystemsComments "
                   + "(systemsId, commentsId) VALUES "
                   + "(" + systemId + "," + row.id + ")"
        query2 = client.query(sql);
        query2.on('end', function() {
            res.status(200);
            res.end();
        });
    });
});

app.post("/api/v1/delete/system/comment", function(req, res) {
    var commentId = req.body.id,
        sql = "UPDATE Comments SET deleted = true WHERE id = " + commentId;
        query = client.query(sql);
    res.end();
});

app.post("/api/v1/system", function(req, res) {
    var requiredKeys = ["name", "description", "coords", "visible"];
    requiredKeys.forEach(function(key) {
        if (req[key] == "undefined" || req[key] == undefined) {
            res.status(500);
            res.end();
        }
    });
    var sql = "INSERT INTO Systems "
            + "(name, description, coords, visible) VALUES "
            + "('" + req.body.name +"', '" + req.body.description + "', " + req.body.coords 
            + ", " + req.body.visible +")",
        query = client.query(sql);
    console.log(sql);

    query.on('end', function() {
        res.status(200);
        res.end();
    });
});

app.post("/api/v1/planet", function(req, res) {
    var requiredKeys = ["name", "description", "systemid", "visible"];
    requiredKeys.forEach(function(key) {
        if (req[key] == "undefined" || req[key] == undefined) {
            res.status(500);
            res.end();
        }
    });
    var sql = "INSERT INTO Planets "
            + "(name, description, systemId, visible) VALUES "
            + "('" + req.body.name +"', '" + req.body.description + "', " + req.body.systemid
            + ", " + req.body.visible +")",
        query = client.query(sql);
    console.log(sql);

    query.on('end', function() {
        res.status(200);
        res.end();
    });
});



app.listen(port);
