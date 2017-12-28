import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as debug from "debug";
import * as morgan from "morgan";
import * as path from "path";

const env = process.env.NODE_ENV || "development";

import { logger, stream } from "./utils/logger";

const port = process.env.PORT || 3000;
const app = express();

app.set("port", port);
app.use(compression());
app.use(morgan("combined", { stream: stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.status(200).json({ title: "Websocket middleware" });
});

const server = app.listen(app.get("port"), () => {
    logger.info(`App is running at http://localhost:${port} in ${env} mode`);
    logger.info("Press CTRL-C to stop");
});

function shutDown() {
    server.close(() => {
        logger.info("Server shutting down");
    });
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
module.exports = app;
