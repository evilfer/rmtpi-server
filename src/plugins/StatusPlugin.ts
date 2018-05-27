import {Plugin} from "../plugin/Plugin";
import {Router} from "express";


export class StatusPlugin extends Plugin {
    public readonly name = 'status';

    private isConnected: boolean = false;
    private status: string = '';

    public clientDisconnected(): void {
        this.isConnected = false;
    }

    public clientReady(send: (payload: any) => void): void {
        this.isConnected = true;
        this.status = '...';
    }

    public prepareRoutes(webRouter: Router, piRouter: Router): void {
        webRouter.get('/', (req, res) => res.send(this.statusText))
    }

    public processMessage(payload: any): void {
        this.status = payload as string;
    }

    private get statusText() {
        return this.isConnected ?
            `Connected: ${this.status}` :
            'Disconnected';
    }
}
