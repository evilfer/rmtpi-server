export interface WsHandler {
    clientReady(send: (payload: any) => void): void;
    clientDisconnected(): void;
    processMessage(payload: any): void;
}

export interface WsHandlerMap {
    [name: string]: WsHandler;
}
