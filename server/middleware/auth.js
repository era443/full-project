const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader)
        return res.status(401).json({ message: "No token provided. Please login." });

    const token = authHeader.split(" ")[1];

    if (!token)
        return res.status(401).json({ message: "Invalid token format." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Decoding adds { id, role } assuming auth.js login sets it
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token is invalid or expired. Please login again." });
    }
}

function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user?.role}) is not allowed to access this resource`
            });
        }
        next();
    };
}

module.exports = { authMiddleware, authorizeRoles };
