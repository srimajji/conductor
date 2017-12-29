import * as jwt from "jsonwebtoken";

import { getToken } from "../utils/helpers";
import { logger } from "../utils/logger";

interface JsonWebToken {
    iss: String;
    roles: String[];
}

export function mainRoute(req: any, res: any) {
    const token = getToken(req.headers["authorization"] as string) || req.query.token;
    if (!token) {
        return res.status(400).json({ error: "No token provided" });
    }
    try {
        const jwtKey = process.env.JWT_KEY || "";
        const jwtIss = process.env.JWT_ISS || "";
        const jwtPayload = jwt.decode(token) as JsonWebToken;
        if (!jwtPayload.iss) {
            throw new Error("No issuer specified");
        } else if (req.session) {
            req.session.user = jwtPayload;
        }
        res.status(200).json({ title: "Websocket middleware", res: req.session });
    } catch (err) {
        logger.error("Error verifying jwt: ", err);
        return res.status(400).json({ error: err });
    }
}
