import * as http from "http";
import * as url from "url";
import * as websocket from "ws";

import { app } from "./app";
import { logger } from "./utils/logger";
import { getToken } from "./utils/helpers";

const server = http.createServer(app);
const wss = new websocket.Server({
    server,
    verifyClient: (info: any, callback: any) => {
        const token = getToken(info.req.headers["Authorization"]);
        logger.info(token!);
        callback(true);
    },
});

// broadcast to all
function broadcast(data: string) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === websocket.OPEN) {
            client.send(data);
        }
    });
}

wss.on("connection", (ws: any, req: any) => {
    const location = url.parse(req.url, true);
    const ip = req.connection.remoteAddress;
    broadcast("new user joined");
    logger.info("Received ws connected request from: ", ip);

    ws.on("message", (message: string) => {
        logger.info("received: ", message);
        broadcast(message);
    });

    ws.send("something");
});

server.listen(app.get("port"), () => {
    require("./rabbitmq/rabbitmq");
    logger.info(`App is running at http://localhost:${server.address().port}`);
    logger.info("Press CTRL-C to stop");
});

function shutDown() {
    server.close(() => {
        logger.info("Server shutting down");
    });
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
