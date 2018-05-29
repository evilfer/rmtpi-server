import {RmtPiApp} from "./app/RmtPiApp";
import {StatusPlugin} from "./plugins/StatusPlugin";
import {WebcamPlugin} from "./plugins/webcam/WebcamPlugin";


function run() {
    const plugins = [
        new StatusPlugin()
    ];

    const app = new RmtPiApp(process.env, plugins);

    app.listen();
}

run();
