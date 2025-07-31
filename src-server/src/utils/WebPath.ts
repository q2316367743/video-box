export function extname(path: string): string {
  const items = path.split(".");
  if (items.length === 1) {
    return '';
  }
  return items[items.length - 1];
}

export function basename(path: string): string {
  const items = path.split("/");
  if (items.length > 1) {
    return items.pop()!;
  }
  return path
}