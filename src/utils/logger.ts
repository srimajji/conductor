import { Logger, LoggerInstance, transports } from "winston";

export const logger = new Logger({
    transports: [
        new transports.Console({
            level: process.env.LOG_LEVEL || "info",
            handleExceptions: true,
            prettyPrint: false,
            json: false,
            colorize: true,
            timestamp: true,
        }),
    ],
    exitOnError: false,
});

export const stream = {
    write: function(message: string) {
        logger.info(message);
    },
};
