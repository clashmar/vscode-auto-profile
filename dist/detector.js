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
exports.detectProfile = detectProfile;
const fs = __importStar(require("fs"));
const config_1 = require("./config");
/**
 * Detect the profile name for a workspace folder by scanning for marker files.
 * Returns the profile name if a match is found, or undefined if none match.
 */
function detectProfile(folder) {
    const rules = (0, config_1.getRules)();
    const root = folder.uri.fsPath;
    // Collect all filenames in workspace root (non-recursive, just top-level)
    let entries;
    try {
        entries = fs.readdirSync(root);
    }
    catch {
        return undefined;
    }
    const fileSet = new Set(entries);
    // Rules are ordered by priority (first match wins)
    for (const rule of rules) {
        if (fileSet.has(rule.marker)) {
            return rule.profile;
        }
    }
    return undefined;
}
//# sourceMappingURL=detector.js.map