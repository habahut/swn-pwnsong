var express = require('express'),
    app = express();

app.use("/", express.static(__dirname + "/../frontEnd"));

app.get("/api/v1/planet/:planet", function(req, res) {
    res.send({"name": "dummy", "description": "dummy2"});
});

app.listen(5050);
