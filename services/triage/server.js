const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3002;

app.get("/triage/health", (req, res) => {

    res.status(200).send("ok");

});

app.use(
    "/triage",
    express.static(
        path.join(__dirname, "public")
    )
);

app.get("/", (req, res) => {

    res.redirect("/triage/");

});

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `SignalDock Triage running on port ${PORT}`
    );

});