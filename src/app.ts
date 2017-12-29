import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import * as debug from "debug";
import * as morgan from "morgan";
import * as path from "path";
import * as redis from "redis";
import * as session from "express-session";
import * as redisStore from "connect-redis";
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
const client = redis.createClient();
const RedisStore = redisStore(session);
const sessionStore = new RedisStore({
    host: "localhost",
    port: 6379,
    client: client,
    ttl: 260,
});

app.set("port", port);
app.use(compression());
app.use(morgan("combined", { stream: stream }));
app.use(
    session({
        secret: "keyboard cat",
        // create new redis store.
        store: sessionStore,
        saveUninitialized: false,
        resave: false,
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", mainRoute);

app.get("/session", (req, res) => {
    res.status(200).json({ title: "Session info", res: req.session });
});

export { app, sessionStore };
