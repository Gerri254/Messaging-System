import { Server } from 'socket.io';
import './config/database';
import './config/redis';
declare const app: import("express-serve-static-core").Express;
declare const server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { app, io };
export default server;
//# sourceMappingURL=app.d.ts.map