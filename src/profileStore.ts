import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface StorageJson {
  profileAssociations?: {
    workspaces?: Record<string, string>;
  };
  [key: string]: unknown;
}

interface ProfileEntry {
  location: string;
  name: string;
}

function getVscodeUserDir(): string {
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

function storagePath(): string {
  return path.join(getVscodeUserDir(), 'globalStorage', 'storage.json');
}

function readStorage(): StorageJson {
  try {
    const raw = fs.readFileSync(storagePath(), 'utf-8');
    return JSON.parse(raw) as StorageJson;
  } catch {
    return {};
  }
}

function writeStorage(data: StorageJson): void {
  const sp = storagePath();
  const tmp = sp + '.tmp.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(data, null, '\t'), 'utf-8');
  fs.renameSync(tmp, sp);
}

function findProfileId(storage: StorageJson, name: string): string | undefined {
  const profiles = (storage as any)['userDataProfiles'] as ProfileEntry[] | undefined;
  if (!profiles) return undefined;
  const entry = profiles.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  return entry?.location;
}

export function getCurrentAssociation(workspacePath: string): string | undefined {
  const storage = readStorage();
  const uri = vscode.Uri.file(workspacePath).toString();
  const assocs = storage.profileAssociations?.workspaces;
  if (!assocs) return undefined;
  const id = assocs[uri];
  return id && id !== '__default__profile__' ? id : undefined;
}

export function setProfileAssociation(
  workspacePath: string,
  profileName: string
): boolean {
  const storage = readStorage();
  const profileId = findProfileId(storage, profileName);
  if (!profileId) return false;

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
