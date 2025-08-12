import type { Request } from 'express';

const GITHUB_API = 'https://api.github.com';

interface GitHubFileResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  content?: string;
  encoding?: 'base64';
}

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
}

function getAuthHeaders() {
  const token = getEnv('GITHUB_TOKEN');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  } as Record<string, string>;
}

function getRepoSettings() {
  return {
    owner: getEnv('GITHUB_OWNER'),
    repo: getEnv('GITHUB_REPO'),
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

export async function getRepoFile(path: string): Promise<{ sha: string | null; content: string | null }> {
  const { owner, repo, branch } = getRepoSettings();
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 404) {
    return { sha: null, content: null };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `GitHub get content failed: ${res.status}`);
  }
  const json = (await res.json()) as GitHubFileResponse;
  const decoded = json.content ? Buffer.from(json.content, 'base64').toString('utf8') : null;
  return { sha: json.sha || null, content: decoded };
}

export async function putRepoFile(path: string, rawContent: string, message: string, sha?: string | null): Promise<{ sha: string }> {
  const { owner, repo, branch } = getRepoSettings();
  const body = {
    message,
    content: Buffer.from(rawContent, 'utf8').toString('base64'),
    branch,
    sha: sha || undefined,
  } as any;
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `GitHub put content failed: ${res.status}`);
  }
  const json = (await res.json()) as GitHubFileResponse;
  return { sha: json.sha };
}

export function getRawFileUrl(path: string): string {
  const { owner, repo, branch } = getRepoSettings();
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

export function getNetlifyBuildHook(): string | undefined {
  return process.env.NETLIFY_BUILD_HOOK_URL;
}

export async function triggerNetlifyBuildIfConfigured() {
  const hook = getNetlifyBuildHook();
  if (!hook) return;
  try {
    await fetch(hook, { method: 'POST' });
  } catch (e) {
    console.error('Failed to trigger Netlify build hook', e);
  }
}