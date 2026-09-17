const express = require("express");
const cors = require("cors");

const {
    DynamoDBClient
} = require("@aws-sdk/client-dynamodb");

const {
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand,
    UpdateCommand
} = require("@aws-sdk/lib-dynamodb");


const app = express();

const PORT = process.env.PORT || 3001;

const STORAGE_MODE =
    process.env.STORAGE_MODE || "memory";

const TABLE_NAME =
    process.env.DYNAMODB_TABLE || "signaldock-signals";

const AWS_REGION =
    process.env.AWS_REGION || "us-east-1";


app.use(cors());
app.use(express.json());


const dynamoClient =
    new DynamoDBClient({
        region: AWS_REGION
    });

const dynamodb =
    DynamoDBDocumentClient.from(dynamoClient);


let signals = [];


app.get("/api/health", (req, res) => {

    res.status(200).json({
        service: "signaldock-api",
        status: "healthy",
        storage: STORAGE_MODE
    });

});


app.get("/api/signals", async (req, res) => {

    try {

        if (STORAGE_MODE === "memory") {

            return res.json(signals);

        }

        const result = await dynamodb.send(
            new ScanCommand({
                TableName: TABLE_NAME
            })
        );

        const items = result.Items || [];

        items.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

        res.json(items);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve signals"
        });

    }

});


app.post("/api/signals", async (req, res) => {

    try {

        const {
            value,
            type,
            severity
        } = req.body;


        if (!value || !type || !severity) {

            return res.status(400).json({
                error:
                    "value, type and severity are required"
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


        if (STORAGE_MODE === "memory") {

            signals.push(signal);

        } else {

            await dynamodb.send(

                new PutCommand({

                    TableName: TABLE_NAME,

                    Item: signal

                })

            );

        }


        res.status(201).json(signal);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to create signal"
        });

    }

});


app.patch(
    "/api/signals/:id",
    async (req, res) => {

        try {

            const {
                status,
                severity
            } = req.body;


            if (STORAGE_MODE === "memory") {

                const signal =
                    signals.find(
                        item =>
                            item.id === req.params.id
                    );


                if (!signal) {

                    return res
                        .status(404)
                        .json({
                            error:
                                "Signal not found"
                        });

                }


                if (status) {
                    signal.status = status;
                }

                if (severity) {
                    signal.severity = severity;
                }


                return res.json(signal);

            }


            const updates = [];

            const names = {};

            const values = {};


            if (status) {

                updates.push(
                    "#status = :status"
                );

                names["#status"] =
                    "status";

                values[":status"] =
                    status;

            }


            if (severity) {

                updates.push(
                    "#severity = :severity"
                );

                names["#severity"] =
                    "severity";

                values[":severity"] =
                    severity;

            }


            if (updates.length === 0) {

                return res
                    .status(400)
                    .json({
                        error:
                            "No supported fields provided"
                    });

            }


            const result =
                await dynamodb.send(

                    new UpdateCommand({

                        TableName:
                            TABLE_NAME,

                        Key: {
                            id:
                                req.params.id
                        },

                        UpdateExpression:
                            `SET ${updates.join(", ")}`,

                        ExpressionAttributeNames:
                            names,

                        ExpressionAttributeValues:
                            values,

                        ReturnValues:
                            "ALL_NEW"

                    })

                );


            res.json(
                result.Attributes
            );


        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Failed to update signal"
            });

        }

    }
);


app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `SignalDock API running on port ${PORT}`
        );

        console.log(
            `Storage mode: ${STORAGE_MODE}`
        );

    }
);