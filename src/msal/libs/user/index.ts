import { Client } from "@microsoft/microsoft-graph-client";
import { User } from "./user"

export * from "./user"

export class UserAPI {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    User(userId: string) {
        return new User(this.client, userId);
    }


}