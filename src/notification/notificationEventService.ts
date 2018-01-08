import * as events from "events";
import { get } from "lodash";

import {
    InsidrNotificationTypes,
    WebSocketNotificationTypes,
} from "../models/notifications/notificationTypes";
import { logger } from "../utils/logger";
import WebSocketService from "../websocket/webSocketService";

declare interface NotificationEventService {
    notfify(event: string, payload: JSON): this;
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
                    "net.insidr.question.NewCompanyBlockingTaskNotification"
                ) {
                    WebSocketService.broadcast(payload);
                } else if (
                    InsidrNotificationTypes[notificationType] ==
                    "net.insidr.routing.EmailQuestionToExpertNotification"
                ) {
                    WebSocketService.sendNotificationToUser(payload.insider.uuid, payload);
                } else if (
                    InsidrNotificationTypes[notificationType] ==
                    "net.insidr.response.NewApprovedResponseMessageNotification"
                )
                    WebSocketService.sendNotificationToUser(payload.insider.uuid, payload);
                else {
                    WebSocketService.sendNotificationToUser(user.uuid, payload);
                }
            }
        });
    });

    export function notify(event: string, payload: JSON) {
        try {
            eventEmitter.emit(event, payload);
        } catch (err) {
            logger.error(err);
        }
    }

    export function subscribe(event: string, listener: (payload: any) => void) {
        logger.info("Subsribing to event:", event);
        return eventEmitter.on(event, listener);
    }
}

export default NotificationEventService;
