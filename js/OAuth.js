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

let self;
let calledViaGetInstance = false;

let _canSignIn = false;
let _events;
let _sessionActive;
let _fileId;

export default class GoogleSession {
    constructor() {
        if (!calledViaGetInstance) throw new Error("You must use the static getInstance() method to get a reference to this class.");

        _events = new Events();
        _sessionActive = false;
        _fileId = undefined;

        let initInterval = window.setInterval(() => {
            if (!window.googleLoaded) return;
            window.gapi.load('client:auth2', () => {
                initClient();
            });
            window.clearInterval(initInterval);
            _canSignIn = true;
        }, 10);
    }

    static getInstance() {
        calledViaGetInstance = true;
        if (!self) self = new GoogleSession();
        calledViaGetInstance = false;
        return self;
    }

    get events() { return _events;}
    get sessionActive() { return _sessionActive; }

    signIn() {
        if (_canSignIn) {
            window.gapi.auth2.getAuthInstance().signIn();
        }
        else {
            alert("Google API not loaded. Please try again in a few seconds.");
        }
    }

    signOut() {
        window.gapi.auth2.getAuthInstance().signOut();
        _sessionActive = false;
    }

    saveState(state) {
        modifyFileWithJSONContent(_fileId, state);
    }
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  window.gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    window.gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => {
        updateSigninStatus(isSignedIn);
    });
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    const eventObj = new Events();
    let folderFound = true;

    eventObj.listen("finished", file => {
        if (file) {
            _fileId = file.id;
            window.gapi.client.drive.files.get({
                fileId: file.id,
                alt: "media"
            }).then(response => {
                _sessionActive = true;
                self.events.emit("signedIn", response.result);
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
            //     // body: "{players:[]}"
            //     body: new Blob([JSON.stringify(emptyState)], { type: "application/json" })
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
        // spaces: "appDataFolder",
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