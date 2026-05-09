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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const config_1 = require("./config");
const detector_1 = require("./detector");
const profileStore_1 = require("./profileStore");
const GUARD_PREFIX = 'AUTO_PROFILE_DONE_';
/**
 * Resolve the workspace path to a stable canonical form.
 * Uses git root when available so worktrees and the main repo resolve to the same key.
 * Falls back to realpath, then the raw path.
 */
function getCanonicalPath(fsPath) {
    try {
        const gitRoot = (0, child_process_1.execSync)('git rev-parse --show-toplevel', {
            cwd: fsPath,
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'ignore'],
            timeout: 5000,
        }).trim();
        if (gitRoot && gitRoot === path.resolve(fsPath, gitRoot)) {
            return gitRoot;
        }
        if (gitRoot) {
            return gitRoot;
        }
    }
    catch {
        // Not a git repo or git unavailable
    }
    try {
        return fs.realpathSync(fsPath);
    }
    catch {
        return fsPath;
    }
}
function processFolder(folder) {
    if (!(0, config_1.isEnabled)())
        return false;
    const rawPath = folder.uri.fsPath;
    const canonicalPath = getCanonicalPath(rawPath);
    // Guard: check if we already processed this workspace in this session.
    // Use canonical path so worktrees and main repo share the same guard key.
    if (process.env[GUARD_PREFIX + canonicalPath]) {
        return false;
    }
    const profileName = (0, detector_1.detectProfile)(folder);
    if (!profileName)
        return false;
    // Check if already has a non-default profile association.
    // Use raw path for storage.json — VS Code stores by workspace folder URI.
    const currentId = (0, profileStore_1.getCurrentAssociation)(rawPath);
    if (currentId)
        return false;
    // Write the profile association to storage.json
    const changed = (0, profileStore_1.setProfileAssociation)(rawPath, profileName);
    if (!changed)
        return false;
    // Set guard BEFORE reloading
    process.env[GUARD_PREFIX + canonicalPath] = '1';
    // Reload the window so the new profile takes effect
    vscode.commands.executeCommand('workbench.action.reloadWindow');
    return true;
}
function processAllFolders() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders)
        return;
    for (const folder of folders) {
        if (processFolder(folder))
            return;
    }
}
function activate(context) {
    processAllFolders();
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders((event) => {
        for (const folder of event.added) {
            processFolder(folder);
        }
    }));
}
function deactivate() {
    // Nothing to clean up
}
//# sourceMappingURL=extension.js.map