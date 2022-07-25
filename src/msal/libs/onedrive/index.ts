import { Client } from "@microsoft/microsoft-graph-client";
import { Drive } from "./drive";

export * from "./drive"

export class OneDriveAPI {
    private client: Client;

    constructor(client: Client) {
        this.client = client
    }

    Drive(driveId?: string) {
        return new Drive(this.client, driveId)
    }
}