import { AccountInfo, AuthenticationResult, BrowserCacheLocation, Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { OneDriveAPI } from "./libs/onedrive";
import { UserAPI } from "./libs/user";

export * from "./libs/onedrive"
export * from "./libs/user"

export type GraphAPIConstructArgs = {
    clientId: string;
    cacheLocation?: BrowserCacheLocation,
    scopes?: Array<PermissionScope>;
}

export const enum LoginType {
    Redirect = "redirect",
    Popup = 'popup'
}

export const enum PermissionScope {
    UserRead = "User.Read",
    UserReadBasicAll = "User.ReadBasic.All",
    UserReadWrite = "User.ReadWrite",
    UserReadAll = "User.Read.All",
    UserReadWriteAll = "User.ReadWrite.All",
    DirectoryReadAll = "Directory.Read.All",
    DirectoryReadWriteAll = "Directory.ReadWrite.All",
    DirectoryAccessAsUserAll = "Directory.AccessAsUser.All",
    FilesReadWriteAll = "Files.ReadWrite.All",
}

export class GraphAPI {
    private application: PublicClientApplication;
    private client: Client;
    private scopes: Array<PermissionScope>;
    public User: UserAPI;
    public OneDrive: OneDriveAPI;

    constructor({
        clientId,
        cacheLocation = BrowserCacheLocation.LocalStorage,
        scopes = [],
    }: GraphAPIConstructArgs) {
        const config: Configuration = {
            auth: {
                clientId
            },
            cache: {
                cacheLocation,
                storeAuthStateInCookie: true,
            },
            system: {
                loggerOptions: {
                    loggerCallback: (level, message, containsPii) => {
                        if (containsPii) {
                            return;
                        }
                        // switch (level) {
                        //     case LogLevel.Error:
                        //         console.error(message);
                        //         return;
                        //     case LogLevel.Info:
                        //         console.info(message);
                        //         return;
                        //     case LogLevel.Verbose:
                        //         console.debug(message);
                        //         return;
                        //     case LogLevel.Warning:
                        //         console.warn(message);
                        //         return;
                        // }
                    }
                }
            }
        }
        this.application = new PublicClientApplication(config);
        this.scopes = scopes;
        this.client = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async (): Promise<string> => {
                    const accounts = this.application.getAllAccounts()
                    if (accounts.length > 0) {
                        let active = this.application.getActiveAccount()
                        if (active === null) {
                            throw new Error("Active account is null")
                        }
                        let result = await this.application.acquireTokenSilent({
                            scopes: this.scopes,
                            account: active
                        })
                        if (result.expiresOn !== null && result.expiresOn > new Date()) {
                            return result.accessToken
                        }
                    }
                    throw new Error("Login failed")
                }
            }
        });
        this.User = new UserAPI(this.client);
        this.OneDrive = new OneDriveAPI(this.client)
    }

    public async loginAsync(loginType: LoginType = LoginType.Popup): Promise<AuthenticationResult | null> {
        switch (loginType) {
            case LoginType.Redirect:
                const result = await this.application.handleRedirectPromise()
                if (result == null) {
                    await this.application.loginRedirect({
                        scopes: this.scopes,
                    });
                }
                return result;
            case LoginType.Popup:
                return await this.application.loginPopup({
                    scopes: this.scopes,
                });
        }
    }

    public async logoutAsync(loginType: LoginType = LoginType.Popup): Promise<void> {
        const active = this.application.getActiveAccount()
        if (active !== null) {
            switch (loginType) {
                case LoginType.Redirect:
                    await this.application.logoutRedirect({
                        account: active
                    });
                    break;
                case LoginType.Popup:
                    await this.application.logoutPopup({
                        account: active
                    });
                    break;
            }
        }
    }

    public getActiveAccount(): AccountInfo | null {
        return this.application.getActiveAccount()
    }

    public setActiveAccount(account: AccountInfo): void {
        this.application.setActiveAccount(account)
    }

    public getAccounts(): Array<AccountInfo> {
        return this.application.getAllAccounts()
    }

}