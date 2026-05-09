import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { isEnabled } from './config';
import { detectProfile } from './detector';
import { setProfileAssociation, getCurrentAssociation } from './profileStore';

const GUARD_PREFIX = 'AUTO_PROFILE_DONE_';

/**
 * Resolve the workspace path to a stable canonical form.
 * Uses git root when available so worktrees and the main repo resolve to the same key.
 * Falls back to realpath, then the raw path.
 */
function getCanonicalPath(fsPath: string): string {
  try {
    const gitRoot = execSync('git rev-parse --show-toplevel', {
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
  } catch {
    // Not a git repo or git unavailable
  }

  try {
    return fs.realpathSync(fsPath);
  } catch {
    return fsPath;
  }
}

function processFolder(folder: vscode.WorkspaceFolder): boolean {
  if (!isEnabled()) return false;

  const rawPath = folder.uri.fsPath;
  const canonicalPath = getCanonicalPath(rawPath);

  // Guard: check if we already processed this workspace in this session.
  // Use canonical path so worktrees and main repo share the same guard key.
  if (process.env[GUARD_PREFIX + canonicalPath]) {
    return false;
  }

  const profileName = detectProfile(folder);
  if (!profileName) return false;

  // Check if already has a non-default profile association.
  // Use raw path for storage.json — VS Code stores by workspace folder URI.
  const currentId = getCurrentAssociation(rawPath);
  if (currentId) return false;

  // Write the profile association to storage.json
  const changed = setProfileAssociation(rawPath, profileName);
  if (!changed) return false;

  // Set guard BEFORE reloading
  process.env[GUARD_PREFIX + canonicalPath] = '1';

  // Reload the window so the new profile takes effect
  vscode.commands.executeCommand('workbench.action.reloadWindow');
  return true;
}

function processAllFolders(): void {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) return;

  for (const folder of folders) {
    if (processFolder(folder)) return;
  }
}

export function activate(context: vscode.ExtensionContext) {
  processAllFolders();

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders((event) => {
      for (const folder of event.added) {
        processFolder(folder);
      }
    })
  );
}

export function deactivate() {
  // Nothing to clean up
}
