import Events from "./Events.js";

// Client ID and API key from the Developer Console
const CLIENT_ID = '532641827164-6j6ie39n7auhdvijjn19j5pjs589svob.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAIf-LJvAuVyYHooeFptX4zj6vspItNY3g';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata";
let canSignIn = false;

export default class GoogleSession {
    constructor() {
        this._events = new Events();
        this._sessionActive = false;
        this._fileId = undefined;

        let initInterval = window.setInterval(() => {
            if (!window.googleLoaded) return;
            window.gapi.load('client:auth2', () => {
                initClient(this);
            });
            window.clearInterval(initInterval);
            canSignIn = true;
        }, 10);
    }

    get events() { return this._events;}
    get sessionActive() { return this._sessionActive; }

    signIn() {
        if (canSignIn) {
            window.gapi.auth2.getAuthInstance().signIn();
        }
        else {
            alert("Google API not loaded. Please try again in a few seconds.");
        }
    }

    signOut() {
        window.gapi.auth2.getAuthInstance().signOut();
    }

    saveState(state) {
        modifyFileWithJSONContent(this._fileId, state);
    }
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient(session) {
  window.gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    window.gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => {
        updateSigninStatus(session, isSignedIn);
    });
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(session, isSignedIn) {
  if (isSignedIn) {
    const eventObj = new Events();
    let folderFound = true;

    eventObj.listen("finished", file => {
        if (file) {
            // TODO:
            session._fileId = file.id;
            window.gapi.client.drive.files.get({
                fileId: file.id,
                alt: "media"
            }).then(response => {
                session.events.emit("signedIn", response.result);
            });



            // console.log("deleting file because shit ass");
            // window.gapi.client.drive.files.delete({
            //     fileId: file.id
            // }).then(response => {
            //     console.log("Delete file result", response);
            // });

        }
        else {


            // I can't figure out how to do this. I will ask Reddit.
            console.log("Creating state.json file");

            const emptyState = {players:[]};
            createFileWithJSONContent("state.json", emptyState, f => {
                getStateFile(eventObj);
            });

            // Leaving this code here because I dislike the way I'm having to do this currently.
            // const fileMetadata = {
            //     name: "state.json",
            //     //parents: ["appDataFolder"],
            //     //mimeType: "application/json",
            //     //body: JSON.stringify({players:[]})
            // };
            // const media = {
            //     mimeType: "application/json",
            //     body: "{players:[]}"
            // };
            // const promise = window.gapi.client.drive.files.create({
            //     resource: fileMetadata,
            //     media: media,
            //     fields: "id",
            //     //body: JSON.stringify({players:[]})
            // }).then((response, b, c) => {
            //     console.log("Created file result", response, b, c);
            //     window.gapi.client.drive.files.get({
            //         fileId: response.result.id,
            //         alt: "media"
            //     }).then(response => {
            //         console.log("Get file result", response);
            //     });
            // });
        }
    });

    getStateFile(eventObj);
  }
}

function getStateFile(eventObj, pageToken) {
    window.gapi.client.drive.files.list({
        //spaces: "appDataFolder",
        files: "nextPageToken, files(id, name)",
        pageSize: 10,
        pageToken
    }).then(response => {
        const file = response.result.files.filter(f => f.name === "state.json")[0];

        if (file) eventObj.emit("finished", file);
        else if (response.result.nextPageToken) window.setTimeout(() => getStateFile(eventObj, response.result.nextPageToken), 0);
        else eventObj.emit("finished");
    });
}

function createFileWithJSONContent(fileName, jsonObj, callback) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = "application/json";

    const metadata = {
        name: fileName,
        mimeType: contentType
    };

    const multiPartRequestBody =
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: " + contentType + "\r\n\r\n" +
        JSON.stringify(jsonObj) +
        close_delim;

    const request = window.gapi.client.request({
        path: "/upload/drive/v3/files",
        method: "POST",
        params: {uploadType: "multipart"},
        headers: {
            "Content-Type": "multipart/related; boundary=\"" + boundary + "\""
        },
        body: multiPartRequestBody
    });

    if (!callback) {
        callback = function(file) { console.log(file); };
    }
    request.execute(callback);
}

function modifyFileWithJSONContent(fileId, jsonObj, callback) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = "application/json";

    const metadata = {
        mimeType: contentType
    };

    const multiPartRequestBody =
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: " + contentType + "\r\n\r\n" +
        JSON.stringify(jsonObj) +
        close_delim;

    const request = window.gapi.client.request({
        path: "/upload/drive/v3/files/" + fileId,
        method: "PATCH",
        params: {uploadType: "multipart"},
        headers: {
            "Content-Type": "multipart/related; boundary=\"" + boundary + "\""
        },
        body: multiPartRequestBody
    });

    if (!callback) {
        callback = function(file) { console.log(file); };
    }
    request.execute(callback);
}