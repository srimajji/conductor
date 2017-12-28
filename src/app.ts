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

import { logger, stream } from "./utils/logger";
import { getToken } from "./utils/helpers";

const configFile = path.resolve("config", "dev.config");
const config = dotenv.config({ path: configFile });
dotenvExpand(config);

const env = process.env.NODE_ENV;
const port = process.env.NODE_PORT;

const app = express();
const client = redis.createClient();
const RedisStore = redisStore(session);

app.set("port", port);
app.use(compression());
app.use(morgan("combined", { stream: stream }));
app.use(
    session({
        secret: "keyboard cat",
        // create new redis store.
        store: new RedisStore({
            host: "localhost",
            port: 6379,
            client: client,
            ttl: 260,
        }),
        saveUninitialized: false,
        resave: false,
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    const jwtSecret: string = process.env.JWT_SECRET || "";
    const jwtIss: string = process.env.JWT_ISSUER || "";

    const token = getToken(req.headers["authorization"] as string) || req.query.token;
    if (!token) {
        return res.status(400).json({ error: "No token provided" });
    }
    logger.debug("", token);
    try {
        const jwtPayload = jwt.decode(token);
        if (req.session) {
            req.session.user = jwtPayload;
        }
        res.status(200).json({ title: "Websocket middleware", res: req.session });
    } catch (err) {
        return res.status(400).json({ error: err });
    }
});

app.get("/session", (req, res) => {
    res.status(200).json({ title: "Session info", res: req.session });
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
