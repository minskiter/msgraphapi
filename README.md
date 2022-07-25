# Microsoft Fluent GraphAPI

## Install

``` sh
pnpm i msgraphapi
```

## Docs(VitePress)

``` sh
pnpm run docs:dev
```

## Build

``` sh
pnpm run build
```

## Usage

### Login

``` js
import { GraphAPI , ConflictBehavior } from "msgraphapi"
const graphAPI = new GraphAPI({
    clientId: '{clientId}',
    scoped: [PermissionScope.UserReadWrite,PermissionScope.FilesReadWriteAll]
})
// login first: redirect or popup
graphAPI.loginAsync().then(res=>{
    console.log(res)
})
```

### OneDrive

``` js
let drive = graphAPI.drive("{driveId|me}")
// fluent call
drive.item("{itemId}").path("{relative path}").getAsync()
// clone context, get FileOrFolder info
drive.clone().item("{itemId2}").path("{relative path}").getAsync()
console.log(drive.itemId)
// cnosole result: {itemId}
// create folder
drive.clone().item().createListAsync({
    name: "folder",
    conflict: ConflictBehavior.Fail
})
```

## LICENSE

MIT