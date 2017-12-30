import * as http from "http";
import * as url from "url";
import * as websocket from "ws";

import { app } from "./app";
import { logger } from "./utils/logger";
import { getToken } from "./utils/helpers";
import WebSocketService from "./websocket/webSocketService";
import { connectRabbitMq } from "./rabbitmq/rabbitmq";

const server = http.createServer(app);

WebSocketService.createWebSocketServer(server);

connectRabbitMq.catch((err: any) => {
    logger.error("Check rabbitmq connection settings\n", err);
    gracefullyShutdown();
});

["SIGTERM", "SIGINT"].forEach((event: any) => {
    process.on(event, gracefullyShutdown);
});

function gracefullyShutdown() {
    server.close(() => {
        WebSocketService.closeWebSocketServer();
        logger.info("Server shutting down");
        process.exit();
    });
}

server.listen(app.get("port"), () => {
    logger.info(`App is running at http://localhost:${server.address().port}`);
    logger.info("Press CTRL-C to stop");
});
