export function parseBranches(branches: string): string[] {
  return branches
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
