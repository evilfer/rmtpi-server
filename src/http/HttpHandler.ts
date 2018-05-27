import {Router} from "express";

export interface HttpHandler {
    prepareRoutes(router: Router): void;
}
