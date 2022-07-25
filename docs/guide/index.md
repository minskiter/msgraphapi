<script lang="ts" setup>
import { GraphAPI, PermissionScope } from "@/msal"
import {ConflictBehavior, DownloadType, Drive} from "@/msal/libs/onedrive"
import * as GraphTypes from "@microsoft/microsoft-graph-types"
import { ref } from "vue"
import { onMounted } from "vue"; 

const graphAPI = new GraphAPI({
    clientId: "04504778-db6b-4ac9-8685-94f3996766d4",
    scopes: [PermissionScope.UserReadWrite,PermissionScope.FilesReadWriteAll]

})

const logs = ref<string>("")

function appendLogs(info:unknown){

    if (typeof info=="object"){
        logs.value = `${logs.value}\n${JSON.stringify(info,null,4)}\n`

    }else if (typeof info=="string"){
        logs.value = `${logs.value}\n${info}\n`

    }

}

async function Login(){

    appendLogs(await graphAPI.loginAsync())

}

async function GetAccounts(){

    appendLogs(graphAPI.getAccounts())

}

async function GetActiveAccount(){

    appendLogs(graphAPI.getActiveAccount())

}
const drive = ref<Drive|null>(null)

async function GetDrive(){

    driveId.value = "me"
    drive.value = graphAPI.OneDrive.Drive();
    appendLogs(await drive.value.getAsync())

}

async function SetDrive(){
    if (driveId.value!==null){
        drive.value?.reset()
        drive.value?.drive(driveId.value)

    }

}

async function SetItem(){
    if (itemId.value!==null){
        drive.value?.item(itemId.value)

    }

}

const path = ref<string|null>(null)
async function SetPath(){
    if (path.value!==null){
        drive.value?.path(path.value)

    }

}

const driveId = ref<string|null>(null)

const itemId = ref<string>("")

const search = ref<string>("")

async function ListDriveChildren(){

    if (drive.value!==null){
            if (search.value.length>0){
                appendLogs((await drive.value.listAsync()).filter(e=>e.name?.includes(search.value)))
            }else{
                appendLogs((await drive.value.listAsync()))
            }

    }

}

const input = ref<HTMLInputElement|null>(null)
const file = ref<File|null>(null)
const conflict = ref<ConflictBehavior>(ConflictBehavior. Fail)

onMounted(()=>{

    if (input.value!==null){
        input.value.onchange = (evt)=>{
            evt.stopPropagation()
            if (input.value!==null && input.value?.files!==null && input.value.files.length>0){
                file.value = input.value.files[0]
            }

        }

    }

})

async function Upload(){

    if (file.value!==null){
        appendLogs(await drive.value?.uploadAsync({
            file:file.value, 
            conflict: conflict.value
        }))
    }else{
        alert("empty arguments")

    }

}

const lockName = ref<string>("")
async function UploadLock(){

    let file = new File([new Date().toString()], `~$${lockName.value}` , {
                type:"text/plain"
            })
    if (lockName.value.length>0){
        let result = await drive.value?.uploadAsync({
            file, 
            conflict: conflict.value
        })
        appendLogs(result)
    }else{
        console.log(file)

    }

}

async function DownloadItem(){

    await drive.value?.downloadAsync(DownloadType.Direct)

}

async function DeleteItem(){

    let result = await drive.value?.delAsync()
    appendLogs(result)

}

async function CreateDriveChildren(){
    let result = await drive.value?.createListAsync()
    appendLogs(result)
}

async function SetActiveAccount(){

    let accounts = await graphAPI.getAccounts()
    if (accounts.length>0){
        await graphAPI.setActiveAccount(accounts[0])

    }

}

</script>

<pre style="min-height:100px; max-height: 80vh; width: 100%; overflow: auto; font-size: 12px; border-radius: 5px; ">
{{logs}}
</pre>

<style lang="scss" scoped>

    button{
        margin: 10px; 
        border: 1px solid rgba(13, 58, 102, 1); 
        border-radius: 5px; 
        padding: 0 5px; 
        height: 30px; 
        cursor: pointer; 
        &:hover{
            opacity: 0.8; 

        }

    }

    input{
        margin: 10px; 
        height: 30px; 
        width: 300px; 
        /* background-color: antiquewhite;  */
        border: 1px solid rgba(13, 58, 102, 1); 
        padding: 0 5px; 
        border-radius: 5px; 

    }

</style>

<div>
<div>
itemId: {{itemId}}
</div>
<div>
driveId: {{driveId}}
</div>
<div>
search: {{search}}
</div>
</div>

<div style="display: flex; flex-wrap: wrap; ">
<div>
<button @click="logs=''">Clear</button>
<button @click="Login">Login</button>
<button @click="GetAccounts">GetAccounts</button>
<button @click="GetActiveAccount">GetActiveAccount</button>
<button @click="SetActiveAccount">SetActiveAccount</button>
</div>
<div>

<input type="text" v-model="search" placeholder="search">

</div>

<div>
<input type="file" ref="input" />
<input type="text" v-model="conflict" placeholder="fail|rename|replace">
<input type="text" v-model="lockName" placeholder="lockName">
<div>
Drive: <input type="text" v-model="driveId" placeholder="driveId"/> <button type="button" @click="GetDrive">GET</button> <button type="button" @click="SetDrive">SET</button>
</div>
<div>
Item: <input type="text"  v-model="itemId"  placeholder="itemId"/>  <button type="button" @click="SetItem">SET</button>
</div>

<div>
Path: <input type="text" v-model="path"/> <button type="button" @click="SetPath">SET</button>
</div>
<div>
<button type="button" @click="Upload">Upload File</button>
<button type="button" @click="UploadLock">Upload Lock</button>
<button type="button" @click="DownloadItem">Download</button>
<button type="button" @click="DeleteItem">Delete</button>
<button @click="ListDriveChildren">List</button>
<button @click="CreateDriveChildren">Create</button>
</div>
</div>
</div>
