import {Router} from "express";

export interface HttpHandler {
    prepareRoutes(webRouter: Router, piRouter: Router): void;
}
