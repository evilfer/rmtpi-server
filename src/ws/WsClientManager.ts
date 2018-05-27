import {Server as HttpServer} from "http";
import WebSocket, {Server as WsServer} from 'ws';
import {WsHandler, WsHandlerMap} from "./WsHandler";
import {Plugin} from "../app/Plugin";

export class WsClientManager {
    private server: WsServer;
    private isConnected: boolean = false;
    private handlerMap: WsHandlerMap;

    constructor(private handlers: Plugin[], clientToken: String, httpServer: HttpServer) {
        this.server = new WsServer({
            server: httpServer,
            path: `/${clientToken}`
        });

        this.handlerMap = handlers.reduce((acc, handler) => {
            acc[handler.name] = handler;
            return acc;
        }, {} as WsHandlerMap);

        this.listen();
    }

    private listen() {
        this.server.on('connection', ws => this.connected(ws));
    }

    private connected(ws: WebSocket) {
        console.log('connection attempt');

        if (this.isConnected) {
            ws.close();
            return;
        }

        console.log('client connected');
        this.isConnected = true;

        ws.on('message', this.processMsg.bind(this));
        ws.on('close', this.disconnected.bind(this));

        this.handlers.forEach(handler => handler.clientReady(payload => ws.send(JSON.stringify({group: handler.name, payload}))));
    }

    private processMsg(msg: string) {
        try {
            const {group, payload} = JSON.parse(msg);
            console.log(`message for ${group}`);

            const handler = this.handlerMap[group];
            if (handler) {
                handler.processMessage(payload);
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    private disconnected() {
        console.log('client disconnected');
        this.isConnected = false;
        this.handlers.forEach(handler => handler.clientDisconnected());
    }
}
