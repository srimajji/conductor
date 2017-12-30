interface Notification {
    id: number;
    class: string;
    dateCreated: Date;
}

interface User {
    uuid: string;
    name: string;
    emailAddress: string;
}

export default interface InsidrNotification {
    notification: Notification;
    user: string;
    // tslint:disable-next-line:semicolon
};
