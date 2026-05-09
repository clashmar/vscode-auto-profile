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
exports.DEFAULT_RULES = void 0;
exports.getRules = getRules;
exports.isEnabled = isEnabled;
const vscode = __importStar(require("vscode"));
/**
 * Default rules mapping marker files to profile names.
 * Users can override via the `autoProfile.rules` setting.
 */
exports.DEFAULT_RULES = [
    { marker: 'Cargo.toml', profile: 'Rust' },
    { marker: 'Gemfile', profile: 'Ruby' },
    { marker: 'composer.json', profile: 'PHP' },
    { marker: 'pyproject.toml', profile: 'Python' },
    { marker: 'requirements.txt', profile: 'Python' },
];
/** Get effective rules from settings (or defaults). */
function getRules() {
    const config = vscode.workspace.getConfiguration('autoProfile');
    const raw = config.get('rules');
    if (!raw)
        return exports.DEFAULT_RULES;
    return Object.entries(raw).map(([marker, profile]) => ({ marker, profile }));
}
/** Check if auto-profile is enabled. */
function isEnabled() {
    return vscode.workspace.getConfiguration('autoProfile').get('enabled', true);
}
//# sourceMappingURL=config.js.map