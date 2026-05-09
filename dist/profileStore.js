"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAssociation = getCurrentAssociation;
exports.setProfileAssociation = setProfileAssociation;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
function getVscodeUserDir() {
    const home = os.homedir();
    switch (process.platform) {
        case 'darwin':
            return path.join(home, 'Library', 'Application Support', 'Code', 'User');
        case 'linux':
            return path.join(home, '.config', 'Code', 'User');
        case 'win32':
            return path.join(process.env.APPDATA || '', 'Code', 'User');
        default:
            return path.join(home, 'Library', 'Application Support', 'Code', 'User');
    }
}
function storagePath() {
    return path.join(getVscodeUserDir(), 'globalStorage', 'storage.json');
}
function readStorage() {
    try {
        const raw = fs.readFileSync(storagePath(), 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function writeStorage(data) {
    const sp = storagePath();
    const tmp = sp + '.tmp.' + process.pid;
    fs.writeFileSync(tmp, JSON.stringify(data, null, '\t'), 'utf-8');
    fs.renameSync(tmp, sp);
}
function findProfileId(storage, name) {
    const profiles = storage['userDataProfiles'];
    if (!profiles)
        return undefined;
    const entry = profiles.find((p) => p.name.toLowerCase() === name.toLowerCase());
    return entry?.location;
}
function getCurrentAssociation(workspacePath) {
    const storage = readStorage();
    const uri = vscode.Uri.file(workspacePath).toString();
    const assocs = storage.profileAssociations?.workspaces;
    if (!assocs)
        return undefined;
    const id = assocs[uri];
    return id && id !== '__default__profile__' ? id : undefined;
}
function setProfileAssociation(workspacePath, profileName) {
    const storage = readStorage();
    const profileId = findProfileId(storage, profileName);
    if (!profileId)
        return false;
    const uri = vscode.Uri.file(workspacePath).toString();
    if (!storage.profileAssociations) {
        storage.profileAssociations = {};
    }
    if (!storage.profileAssociations.workspaces) {
        storage.profileAssociations.workspaces = {};
    }
    if (storage.profileAssociations.workspaces[uri] === profileId) {
        return false;
    }
    storage.profileAssociations.workspaces[uri] = profileId;
    writeStorage(storage);
    return true;
}
//# sourceMappingURL=profileStore.js.map