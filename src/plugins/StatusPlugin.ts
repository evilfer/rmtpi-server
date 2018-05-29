import {Plugin} from "../plugin/Plugin";
import {Router} from "express";


export class StatusPlugin extends Plugin {
    public readonly name = 'status';

    private isConnected: boolean = false;
    private publicIp: null | string = null;

    public clientDisconnected(): void {
        this.isConnected = false;
        this.publicIp = null;
    }

    public clientReady(send: (payload: any) => void): void {
        this.isConnected = true;
    }

    public prepareRoutes(webRouter: Router, piRouter: Router): void {
        webRouter.get('/', (req, res) => res.json(this.statusData))
    }

    public processMessage(payload: any): void {
        this.publicIp = payload.publicIp;
    }

    private get statusData() {
        return {
            connected: this.isConnected,
            publicIp: this.publicIp
        };
    }
}
