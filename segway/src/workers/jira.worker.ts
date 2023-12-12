//
import { ConsumeMessage } from "amqplib"
// base worker
import { BaseWorker } from "workers";


export class JiraImportWorker extends BaseWorker {

    constructor() {
        super('importer');
    }

    protected onMessage(msg: ConsumeMessage | null): void {
    }

}