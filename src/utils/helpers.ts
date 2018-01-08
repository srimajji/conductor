import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";

export function getToken(authHeader?: string) {
    if (authHeader && authHeader.indexOf("Bearer") > -1) {
        const token = authHeader.split(" ").pop();
        return token;
    } else {
        return undefined;
    }
}

export function verifyToken(token: string): Promise<any> {
    const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "directly";

    return new Promise((resolve: any, reject: any) => {
        if (!token) {
            reject("No token provided");
        } else {
            const keyFilePath = path.resolve("config", "publicKey.pem");
            const publicKey = fs.readFileSync(keyFilePath);
            jwt.verify(token, publicKey, { issuer: JWT_AUDIENCE }, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        }
    });
}
