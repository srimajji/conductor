import * as websocket from "ws";
import * as http from "http";

import { getToken } from "../utils/helpers";
import { logger } from "../utils/logger";
import * as url from "url";

let _wss: any;

function verifyClient(info: any, callback: Function) {
    const token = getToken(info.req.headers["Authorization"]);
    if (!token) {
        logger.error("Error authorizating ws connection", info.req.headers);
        callback(false);
    } else {
        callback(true);
    }
}

function broadcast(data: string) {
    _wss.clients.forEach(function each(client: any) {
        if (client.readyState === websocket.OPEN) {
            client.send(data);
        }
    });
}

export function createWebSocketServer(server: http.Server) {
    if (!server) {
        throw new Error("Server instance is required for Websocket");
    }

    _wss = new websocket.Server({
        server,
        verifyClient: verifyClient,
    });

    _wss.on("connection", (ws: any, req: any) => {
        const location = url.parse(req.url, true);
        const ip = req.connection.remoteAddress;
        logger.info("Received ws connected request from: ", ip);

        ws.on("message", (message: string) => {
            logger.info("received: ", message);
            broadcast(message);
        });

        ws.send("something");
    });
}
