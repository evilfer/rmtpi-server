import http, {Server} from "http";
import express, {Express} from "express";
import {Plugin} from "./Plugin";
import {WsClientManager} from "../ws/WsClientManager";
import ProcessEnv = NodeJS.ProcessEnv;


export class RmtPiApp {
    private readonly app: Express;
    private readonly server: Server;
    private wsClient: WsClientManager;

    public constructor(private env: ProcessEnv, private plugins: Plugin[]) {
        const clientToken = env.CLIENT_TOKEN || 'client_token';

        this.app = this.prepareRoutes();
        this.server = http.createServer(this.app);
        this.wsClient = new WsClientManager(plugins, clientToken, this.server);
    }


    private prepareRoutes() {
        const app = express();

        this.plugins.forEach(plugin => {
            const router = express.Router();
            plugin.prepareRoutes(router);
            app.use(`/${plugin.name}`, router);
        });

        return app;
    }

    public listen() {
        this.server.listen(this.env.PORT || 3000, () => {
            console.log(`Server started on port ${this.addressText}`);
        });
    }

    private get addressText() {
        const addr = this.server.address();
        if (typeof addr === 'string') {
            return addr;
        } else {
            return `${addr.address}:${addr.port}`;
        }
    }
}
