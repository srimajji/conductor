import * as http from "http";
import * as url from "url";
import * as websocket from "ws";

import { app } from "./app";
import { logger } from "./utils/logger";
import { getToken } from "./utils/helpers";
import { createWebSocketServer } from "./websocket/webSocketManager";
import * as rabbitmq from "./rabbitmq/rabbitmq";

const server = http.createServer(app);

createWebSocketServer(server);

["SIGTERM", "SIGINT"].forEach((event: any) => {
    process.on(event, () => {
        server.close(() => {
            logger.info("Server shutting down");
        });
    });
});

server.listen(app.get("port"), () => {
    logger.info(`App is running at http://localhost:${server.address().port}`);
    logger.info("Press CTRL-C to stop");
});
