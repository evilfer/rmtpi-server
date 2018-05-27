import {WsHandler} from "../ws/WsHandler";
import {HttpHandler} from "../http/HttpHandler";

export interface Plugin extends WsHandler, HttpHandler {
    readonly name: string;
}
