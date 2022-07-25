import { Client, Range, FileUpload, LargeFileUploadTask, LargeFileUploadTaskOptions, UploadEventHandlers } from "@microsoft/microsoft-graph-client";
import { DriveItem } from "@microsoft/microsoft-graph-types";

export const enum ConflictBehavior {
    Rename = "rename",
    Fail = "fail",
    Replace = "replace"
}

export const enum DownloadType {
    Blob = "blob",
    Direct = "direct"
}

export class Drive {
    private driveId?: string;
    private itemId?: string;
    private __relPath?: string;
    private client: Client;
    constructor(client: Client, driveId?: string) {
        this.client = client
        this.driveId = driveId;
    }

    private __buildPath(path: string[] = []) {
        const rootPath = []
        if (this.driveId !== undefined) {
            rootPath.push(`drives`, this.driveId)
        } else {
            rootPath.push("me", "drive")
        }
        if (this.itemId !== undefined) {
            if (this.itemId == "root") {
                rootPath.push("root")
            } else {
                rootPath.push("items", this.itemId)
            }
        } else {
            if (this.__relPath !== undefined || path.length > 0) {
                rootPath.push("root")
            }
        }
        const _path = ["/"]
        _path.push(rootPath.join("/"))
        if (this.__relPath !== undefined) {
            _path.push(":/", this.__relPath)
        }
        if (path.length > 0) {
            _path.push(this.__relPath === undefined ? "/" : ":/", path.join("/"))
        }
        return _path.join("")
    }

    public reset(driveId?: string) {
        this.driveId = driveId === undefined ? this.driveId : driveId
        this.itemId = undefined
        this.__relPath = undefined
        return this
    }

    drive(driveId: string = "root") {
        this.driveId = driveId;
        return this;
    }

    clone() {
        return new Drive(this.client, this.driveId).item(this.itemId).path(this.__relPath);
    }

    item(itemId?: string) {
        this.itemId = itemId;
        return this;
    }

    path(path?: string) {
        this.__relPath = path;
        return this;
    }

    async createListAsync({
        name = "New Folder",
        conflict = ConflictBehavior.Fail
    }: {
        name: string,
        conflict: ConflictBehavior
    } = {
            name: "New Folder",
            conflict: ConflictBehavior.Fail
        }) {
        return await this.client.api(this.__buildPath(["children"])).post({
            "@microsoft.graph.conflictBehavior": conflict,
            name,
            folder: {}
        })
    }

    async listAsync(): Promise<DriveItem[]> {
        return (await this.client.api(this.__buildPath(["children"])).get())?.value;
    }

    async getAsync<T>(): Promise<T> {
        return await this.client.api(this.__buildPath()).get();
    }

    async delAsync(): Promise<void> {
        return await this.client.api(this.__buildPath()).del();
    }

    async downloadAsync(type: DownloadType = DownloadType.Blob) {
        let metadata: DriveItem & { "@microsoft.graph.downloadUrl": string } = await this.client.api(this.__buildPath()).get();
        if (type === DownloadType.Blob && typeof metadata["@microsoft.graph.downloadUrl"] === "string") {
            return {
                content: await (fetch(metadata["@microsoft.graph.downloadUrl"]).then(res => res.blob())),
                name: metadata.name?.toString()
            }
        } else if (type === DownloadType.Direct) {
            if (document !== undefined && document.createElement !== undefined) {
                const a = document.createElement("a")
                if (metadata.name?.toString() !== undefined) {
                    a.download = metadata.name?.toString()
                } else {
                    a.download = "download"
                }
                a.href = metadata["@microsoft.graph.downloadUrl"]
                a.click()
                a.remove()
            }
        }
    }

    async uploadAsync({
        file,
        conflict = ConflictBehavior.Fail,
        progress,
        description
    }: {
        file: File,
        conflict: ConflictBehavior,
        progress?: (range?: Range, extraCallbackParam?: unknown) => void,
        description?: string
    }) {
        if (file.size < 4 * 1024 * 1024) {
            return await this.client.api(this.__buildPath(["content"])).query({
                "@microsoft.graph.conflictBehavior": conflict
            }).put(file)
        } else {
            const payload = {
                "@microsoft.graph.conflictBehavior": conflict,
                "name": file.name,
                "description": description,
            }
            const session = await LargeFileUploadTask.createUploadSession(
                this.client,
                this.__buildPath(["createUploadSession"]),
                payload
            );
            const fileObject = new FileUpload(file, file.name, file.size);
            const uploadEventHandlers: UploadEventHandlers = {
                extraCallbackParam: file,
                progress,
            };
            const options: LargeFileUploadTaskOptions = {
                rangeSize: 1024 * 1024,
                uploadEventHandlers,
            };
            const task = new LargeFileUploadTask(this.client, fileObject, session, options);
            return await task.upload();
        }
    }

}