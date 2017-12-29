import * as amqp from "amqp";
import { logger } from "../utils/logger";
import { AMQPExchange, AMQPQueue } from "amqp";

const NOTIFICATION_EXCHANGE = process.env.NOTIFICATION_EXCHANGE || "";
const NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || "";
const ROUTING_KEY = process.env.ROUTING_KEY || "";

const options = {
    host: "localhost",
    port: 5672,
    login: "conductor",
    password: "abcd1234",
    vhost: "/",
    connectionTimeout: 10000,
    ssl: { enabled: false },
};

const connection = amqp.createConnection(options);

connection.on("error", err => {
    logger.error("Error from rabbitmq: ", err);
});

let _exchange: any;
let _queue: any;

connection.on("ready", () => {
    logger.info("Amqp connection success");

    connection.exchange(NOTIFICATION_EXCHANGE, { passive: true }, (exchange: any) => {
        _exchange = exchange;

        logger.info("Amqp exchange success");

        connection.queue(NOTIFICATION_QUEUE, { exclusive: true }, (queue: any) => {
            _queue = queue;
            logger.info("Amqp queue success");

            queue.bind(NOTIFICATION_EXCHANGE, ROUTING_KEY);
            queue.subscribe(
                { ack: true },
                (message: MessageEvent, headers: any, deliveryInfo: any, messageObject: any) => {
                    const jsonPayload = JSON.parse(message.data.toString("utf-8"));
                    console.log("Amqp message: ", jsonPayload);
                    queue.shift(false, false);
                }
            );
        });
    });
});

export default connection;
