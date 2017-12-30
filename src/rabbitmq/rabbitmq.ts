import * as amqp from "amqp";
import { logger } from "../utils/logger";
import { AMQPExchange, AMQPQueue } from "amqp";
import NotificationEventService from "../notification/notificationEventService";
import { InsidrNotificationTypes } from "../models/notifications/notificationTypes";
// Rabbitmq connection settings
const RABBITMQ_HOST: string = process.env.RABBITMQ_HOST || "localhost";
const RABBITMQ_PORT: number = Number.parseInt(process.env.RABBITMQ_PORT) || 5672;
const RABBITMQ_USER: string = process.env.RABBITMQ_USER || "guest";
const RABBITMQ_PASSWORD: string = process.env.RABBITMQ_PASSWORD || "guest";
const RABBITMQ_CONNECTION_TIMEOUT: number =
    Number.parseInt(process.env.RABBITMQ_CONNECTION_TIMEOUT) || 10000;

// Rabbitmq exchange and queue settings
const NOTIFICATION_EXCHANGE = process.env.NOTIFICATION_EXCHANGE || "";
const NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || "";
const ROUTING_KEY = process.env.ROUTING_KEY || "";

const options = {
    host: RABBITMQ_HOST,
    port: RABBITMQ_PORT,
    login: RABBITMQ_USER,
    password: RABBITMQ_PASSWORD,
    vhost: "/",
    connectionTimeout: RABBITMQ_CONNECTION_TIMEOUT,
    ssl: { enabled: false },
};

const promise = new Promise((resolve: any, reject: any) => {
    const connection = amqp.createConnection(options);

    connection.on("error", err => {
        if (err.message.indexOf("authentication") > -1) {
            reject(err);
        } else {
            logger.error("Rabbitmq message\n", err);
        }
    });

    let _exchange: any;
    let _queue: any;

    connection.on("ready", () => {
        logger.info("Amqp connection success");

        connection.exchange(NOTIFICATION_EXCHANGE, { passive: true }, (exchange: any) => {
            _exchange = exchange;
            logger.info("Amqp exchange success");

            // Since we are creating a new queue, let's delete it when node shutdowns
            connection.queue(NOTIFICATION_QUEUE, { exclusive: true }, (queue: any) => {
                _queue = queue;
                logger.info("Amqp queue success");
                resolve();

                queue.bind(NOTIFICATION_EXCHANGE, ROUTING_KEY);
                queue.subscribe(
                    { ack: true },
                    (
                        message: MessageEvent,
                        headers: any,
                        deliveryInfo: any,
                        messageObject: any
                    ) => {
                        const jsonPayload = JSON.parse(message.data.toString("utf-8"));
                        if (jsonPayload && jsonPayload.notification) {
                            const notificationClass = jsonPayload.notification.class;
                            logger.info("Publish notification", notificationClass);
                            NotificationEventService.notify(notificationClass, jsonPayload);
                        }

                        // acknowledge message received
                        queue.shift(false, false);
                    }
                );
            });
        });
    });
});

export { promise as connectRabbitMq };
