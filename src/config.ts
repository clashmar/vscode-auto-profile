import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface RuleEntry {
  /** Marker filename to detect (e.g. "Cargo.toml") */
  marker: string;
  /** VS Code profile name to associate */
  profile: string;
}

/**
 * Default rules mapping marker files to profile names.
 * Users can override via the `autoProfile.rules` setting.
 */
export const DEFAULT_RULES: RuleEntry[] = [
  { marker: 'Cargo.toml', profile: 'Rust' },
  { marker: 'Gemfile', profile: 'Ruby' },
  { marker: 'composer.json', profile: 'PHP' },
  { marker: 'pyproject.toml', profile: 'Python' },
  { marker: 'requirements.txt', profile: 'Python' },
];

/** Get effective rules from settings (or defaults). */
export function getRules(): RuleEntry[] {
  const config = vscode.workspace.getConfiguration('autoProfile');
  const raw = config.get<Record<string, string>>('rules');
  if (!raw) return DEFAULT_RULES;
  return Object.entries(raw).map(([marker, profile]) => ({ marker, profile }));
}

/** Check if auto-profile is enabled. */
export function isEnabled(): boolean {
  return vscode.workspace.getConfiguration('autoProfile').get<boolean>('enabled', true);
}
