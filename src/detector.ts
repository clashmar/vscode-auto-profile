import * as vscode from 'vscode';
import * as fs from 'fs';
import { getRules } from './config';

/**
 * Detect the profile name for a workspace folder by scanning for marker files.
 * Returns the profile name if a match is found, or undefined if none match.
 */
export function detectProfile(folder: vscode.WorkspaceFolder): string | undefined {
  const rules = getRules();
  const root = folder.uri.fsPath;

  // Collect all filenames in workspace root (non-recursive, just top-level)
  let entries: string[];
  try {
    entries = fs.readdirSync(root);
  } catch {
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
