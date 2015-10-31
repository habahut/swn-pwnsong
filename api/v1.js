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

app.get("/api/v1/players", function(req, res) {
    var query = client.query("SELECT * FROM Players"),
        results = [];
    query.on('row', function(row) {
        results.push(row);
    });
    query.on('end', function() {
        console.log('players results', results);
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
        console.log('systems results' , results);
        res.send(results);
        res.end();
    });
});

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
                           + "  AND c.deleted = false "
                           + "ORDER BY id");
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



app.listen(5050);
