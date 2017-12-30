import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import * as debug from "debug";
import * as morgan from "morgan";
import * as path from "path";
import * as jwt from "jsonwebtoken";
import * as websocket from "ws";
import * as http from "http";
import * as url from "url";

import { logger, stream } from "./utils/logger";
import { getToken } from "./utils/helpers";
import { mainRoute } from "./routes/main";

const configFile = path.resolve("config", "dev.config");
const config = dotenv.config({ path: configFile });
dotenvExpand(config);

const env = process.env.NODE_ENV;
const port = process.env.NODE_PORT;

const app = express();

app.set("port", port);
app.use(compression());
app.use(morgan("combined", { stream: stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get("/", mainRoute);

export { app };
