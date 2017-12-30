import * as events from "events";
import { get } from "lodash";

import {
    InsidrNotificationTypes,
    WebSocketNotificationTypes,
} from "../models/notifications/notificationTypes";
import { logger } from "../utils/logger";
import WebSocketService from "../websocket/webSocketService";

declare interface NotificationEventService {
    subscribe(event: string, listener: Function): this;
}

namespace NotificationEventService {
    const eventEmitter = new events.EventEmitter();

    Object.keys(InsidrNotificationTypes).map((notificationType: any) => {
        subscribe(InsidrNotificationTypes[notificationType], (payload: any) => {
            const user = get(payload, "user");
            if (user && user.uuid) {
                if (
                    InsidrNotificationTypes[notificationType] ==
                    InsidrNotificationTypes.COMPANY_BLOCKING_TASK
                ) {
                    WebSocketService.broadcast(payload);
                } else {
                    WebSocketService.sendNotificationToUser(user.uuid, payload);
                }
            }
        });
    });

    export function notify(event: string, payload: JSON) {
        eventEmitter.emit(event, payload);
    }

    export function subscribe(event: string, listener: (payload: any) => void) {
        logger.info("Subsribing to event:", event);
        return eventEmitter.on(event, listener);
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
