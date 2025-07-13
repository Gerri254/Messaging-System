"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const database_1 = __importDefault(require("../config/database"));
require("../types/express");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied. No token provided.',
            });
        }
        const token = authHeader.substring(7);
        if (!token) {
            return res.status(401).json({
                error: 'Access denied. No token provided.',
            });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid token. User not found.',
            });
        }
        if (!user.isVerified) {
            return res.status(401).json({
                error: 'Please verify your email address to continue.',
            });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({
            error: error.message || 'Invalid token.',
        });
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        if (!token) {
            return next();
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (user && user.isVerified) {
            req.user = user;
        }
        return next();
    }
    catch (error) {
        return next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map