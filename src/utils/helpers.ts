export function getToken(authHeader?: string) {
    if (authHeader && authHeader.indexOf("Bearer") > -1) {
        const token = authHeader.split(" ").pop();
        return token;
    } else {
        return undefined;
    }
}
