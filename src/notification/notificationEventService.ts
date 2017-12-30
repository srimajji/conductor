import * as events from "events";
import {
    InsidrNotificationTypes,
    WebSocketNotificationTypes,
} from "../models/notifications/notificationTypes";
import { logger } from "../utils/logger";

declare interface NotificationEventService {
    subscribe(event: string, listener: Function): this;
}

namespace NotificationEventService {
    const eventEmitter = new events.EventEmitter();

    export function notify(event: string, payload: JSON) {
        eventEmitter.emit(event, payload);
    }
}

// class NotificationEventService extends events.EventEmitter {
//     private static _instance: NotificationEventService;

//     constructor() {
//         super();
//     }

//     static getInstance() {
//         if (!NotificationEventService._instance) {
//             NotificationEventService._instance = new NotificationEventService();
//         }
//     }
//     emitNotification(payload: JSON): void {
//         logger.info("EMMIT");
//         this.emit("event", payload);
//     }

//     subscribe(event: string, listener: (name: string) => void) {
//         return this.on("event", listener);
//     }
// }

export default NotificationEventService;
