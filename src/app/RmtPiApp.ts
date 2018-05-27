import http, {Server} from "http";
import express, {Express} from "express";
import expressSession from 'express-session';
import {WsClientManager} from "../ws/WsClientManager";
import ProcessEnv = NodeJS.ProcessEnv;
import {Plugin} from "../plugin/Plugin";
import {authMiddleware} from "./auth";


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

        app.use(expressSession({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

        const authRouter = authMiddleware(app, this.env);

        this.plugins.forEach(plugin => {
            const webRouter = express.Router();
            const piRouter = express.Router();

            plugin.prepareRoutes(webRouter, piRouter);
            authRouter.use(`/${plugin.name}`, webRouter);
            app.use(`/${plugin.name}`, piRouter);
        });

        app.use('/', authRouter);

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
