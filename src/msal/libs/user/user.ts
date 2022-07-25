import { Client, ResponseType } from "@microsoft/microsoft-graph-client"
export const enum PhotoSize {
    x48 = "48x48",
    x64 = "64x64",
    x96 = "96x96",
    x120 = "120x120",
    x240 = "240x240",
    x360 = "360x360",
    x432 = "432x432",
    x504 = "504x504",
    x648 = "648x648",
}

export class User {
    private client: Client
    private userId?: string
    private __path: string[] = []

    constructor(
        client: Client,
        userId?: string
    ) {
        this.client = client
        this.userId = userId
    }

    private __buildPath() {
        const rootPath = this.userId === undefined ? "/me" : `/users/${this.userId}`
        if (this.__path.length > 0) {
            return `${rootPath}/${this.__path.join("/")}`
        } else {
            return rootPath
        }
    }

    clone() {
        return new User(this.client, this.userId).path(this.__path)
    }

    photo(size?: PhotoSize) {
        if (size === undefined) this.__path.push("photo")
        else this.__path.push('photos', size)
        return this;
    }

    value() {
        this.__path.push("$value")
        return this;
    }

    user(userId: string) {
        this.userId = userId
        return this;
    }

    path(path: string[]) {
        this.__path = path
        return this;
    }

    reset(userId?: string) {
        this.__path = []
        this.userId = userId === undefined ? this.userId : userId
        return this
    }

    async get<T>() {
        return (await this.client.api(this.__buildPath()).get()) as T;
    }

    async download() {
        return await this.client.api(this.__buildPath()).responseType(ResponseType.BLOB).get();
    }
}