"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    enableReadyCheck: true,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
});
exports.redis = redis;
redis.on('connect', () => {
    console.log('Redis connected successfully');
});
redis.on('error', (error) => {
    console.error('Redis connection error:', error);
});
exports.default = redis;
//# sourceMappingURL=redis.js.map