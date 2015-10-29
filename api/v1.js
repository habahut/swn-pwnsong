var express = require('express'),
    app = express();

app.use("/", express.static(__dirname + "/../frontEnd"));

app.listen(5050);
