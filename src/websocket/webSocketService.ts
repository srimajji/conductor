import * as websocket from "ws";
import * as http from "http";
import * as url from "url";
import * as jwt from "jsonwebtoken";
import { get, set } from "lodash";

import { getToken } from "../utils/helpers";
import { logger } from "../utils/logger";
import NotificationEventService from "../notification/notificationEventService";
import WebSocketConnectionMap from "../models/webSocket/WebSocketConnectionMap";

namespace WebSocketService {
    let _wss: any;
    // tslint:disable-next-line:prefer-const
    let _webSocketConnectionMap: WebSocketConnectionMap = {};

    interface JsonWebToken {
        iss: String;
        roles: String[];
    }

    function verifyClient(info: any, callback: Function) {
        const token =
            getToken(get(info.req.headers, "Authorization")) ||
            get(info.req.headers, "sec-websocket-protocol");
        if (!token) {
            logger.error("Error authorizating ws connection", info.req.headers);
            callback(false, 401, "Unauthorizated access");
        } else {
            try {
                const jwtPayload = jwt.decode(token) as JsonWebToken;
                if (!jwtPayload.iss) {
                    callback(false);
                } else {
                    info.req.user = jwtPayload;
                    callback(true);
                }
            } catch (err) {
                logger.error("Error verifying connection", err);
                callback(false);
            }
        }
    }

    function checkForBrokenConnection() {
        return setInterval(function ping() {
            _wss.clients.forEach(function each(ws: any) {
                if (ws.isAlive === false) return ws.terminate();

                ws.isAlive = false;
                ws.ping("", false, true);
            });
        }, 30000);
    }

    export function broadcast(data: string) {
        _wss.clients.forEach(function each(client: any) {
            if (client.readyState === websocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    export function sendNotificationToUser(userId: string, payload: JSON) {
        const ws: any = get(_webSocketConnectionMap, userId);
        if (ws) {
            ws.send(JSON.stringify(payload));
        }
    }

    export function closeWebSocketServer(): void {
        if (_wss) {
            logger.info("Terminating all socket connections!");
            _wss.close();
        }
    }

    export function createWebSocketServer(server: http.Server) {
        if (!server) {
            throw new Error("Server instance is required for Websocket");
        }

        _wss = new websocket.Server({
            port: 3030,
            server,
            verifyClient: verifyClient,
        });

        _wss.on("connection", (ws: any, req: any) => {
            const location = url.parse(req.url, true);
            const ip = req.connection.remoteAddress;

            set(_webSocketConnectionMap, req.user.uuid, ws);
            ws.send(JSON.stringify({ status: 200, message: "SUCCESS!" }));
            logger.info("User connection success", { userId: req.user.uuid, headers: req.headers });

            // keep connection alive
            ws.isAlive = true;
            ws.on("pong", () => {
                // @ts-ignore
                this.isAlive = true;
            });
            checkForBrokenConnection();

            /* We can ignore client messages for now

            ws.on("message", (message: string) => {
                logger.info("received: ", message);
                broadcast(message);
            });
            ws.send("something");

            */
        });
    }
}

export default WebSocketService;
