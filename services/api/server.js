const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let signals = [];

app.get("/api/health", (req, res) => {

    res.status(200).json({
        service: "signaldock-api",
        status: "healthy"
    });

});


app.get("/api/signals", (req, res) => {

    res.json(signals);

});


app.post("/api/signals", (req, res) => {

    const { value, type, severity } = req.body;

    if (!value || !type || !severity) {

        return res.status(400).json({
            error: "value, type and severity are required"
        });

    }

    const signal = {

        id: `sig-${Date.now()}`,

        value,
        type,
        severity,

        status: "new",

        createdAt:
            new Date().toISOString()
    };

    signals.push(signal);

    res.status(201).json(signal);

});


app.patch("/api/signals/:id", (req, res) => {

    const signal =
        signals.find(
            item => item.id === req.params.id
        );

    if (!signal) {

        return res.status(404).json({
            error: "Signal not found"
        });

    }

    if (req.body.status) {
        signal.status = req.body.status;
    }

    if (req.body.severity) {
        signal.severity = req.body.severity;
    }

    res.json(signal);

});


app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `SignalDock API running on port ${PORT}`
    );

});