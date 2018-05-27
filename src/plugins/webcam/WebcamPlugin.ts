import {Plugin} from "../../app/Plugin";
import {Request, Response, Router} from "express";
import ReadableStream = NodeJS.ReadableStream;
import {WEBCAM_PAGE} from "./webcam-page";


export class WebcamPlugin implements Plugin {
    public readonly name = 'webcam';

    private sendMsg: null | ((payload: any) => void) = null;

    private outputs: Response[] = [];
    private input: null | { stream: ReadableStream, stop: () => void } = null;


    private addOutput(stream: Response) {
        if (this.outputs.indexOf(stream) < 0) {
            this.outputs.push(stream);

            if (this.outputs.length === 1) {
                this.requestStream();
            }
        }
    }

    private removeOutput(output: Response) {
        console.log('removing output');
        const index = this.outputs.indexOf(output);
        if (index >= 0) {
            this.outputs.splice(index, 1);

            if (this.outputs.length === 0) {
                console.log('stopping input stream');

                if (this.input) {
                    this.input.stop();
                }
            }
        }
    }


    private requestStream() {
        if (this.sendMsg !== null) {
            console.log('requesting stream');
            this.sendMsg('stream');
        }
    }

    public clientDisconnected(): void {
        this.sendMsg = null;
        this.outputs = [];
    }

    public clientReady(send: (payload: any) => void): void {
        this.sendMsg = send;
    }

    public prepareRoutes(router: Router): void {
        router.post('/stream.mpg', (req: Request, res: Response) => {
            console.log('received stream');
            this.input = {stream: req, stop: () => res.end()};

            req.on('data', chunk => {
                this.outputs.forEach(output => {
                    output.write(chunk);
                    output.flushHeaders();
                });
            });

            req.on('end', () => {
                this.outputs.forEach(output => output.end());
            });
        });

        router.get('/', (req: Request, res: Response) => {
            res.send(WEBCAM_PAGE);
        });

        router.get('/stream.mpg', (req: Request, res: Response) => {
            console.log('stream request');

            if (!this.clientConnected) {
                return res.status(500).send('No client');
            }

            res.type('multipart/x-mixed-replace; boundary=Boundary');

            this.addOutput(res);

            req.on('close', () => {
                console.log('output disconnected');
                this.removeOutput(res);
            })
        });
    }

    public processMessage(payload: any): void {
    }

    private get clientConnected() {
        return !!this.sendMsg;
    }
}