"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPasswordResetToken = exports.generatePasswordResetToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const generateToken = (payload) => {
    const secret = config_1.default.jwt.secret;
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: config_1.default.jwt.expiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const secret = config_1.default.jwt.secret;
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyToken = verifyToken;
const generatePasswordResetToken = () => {
    const secret = config_1.default.jwt.secret;
    return jsonwebtoken_1.default.sign({}, secret, { expiresIn: '1h' });
};
exports.generatePasswordResetToken = generatePasswordResetToken;
const verifyPasswordResetToken = (token) => {
    try {
        const secret = config_1.default.jwt.secret;
        jsonwebtoken_1.default.verify(token, secret);
        return true;
    }
    catch {
        return false;
    }
};
exports.verifyPasswordResetToken = verifyPasswordResetToken;
//# sourceMappingURL=jwt.js.map