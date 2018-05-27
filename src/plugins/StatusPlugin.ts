import {Plugin} from "../app/Plugin";
import {Router} from "express";


export class StatusPlugin implements Plugin {
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

    public prepareRoutes(router: Router): void {
        router.get('/', (req, res) => res.send(this.statusText))
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
