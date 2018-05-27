import {WsHandler} from "../ws/WsHandler";
import {HttpHandler} from "../http/HttpHandler";
import {Router} from "express";

export abstract class Plugin implements WsHandler, HttpHandler {
    public abstract get name(): string;

    public clientDisconnected(): void {
    }

    public clientReady(send: (payload: any) => void): void {
    }

    public prepareRoutes(webRouter: Router, piRouter: Router): void {
    }

    public processMessage(payload: any): void {
    }
}
