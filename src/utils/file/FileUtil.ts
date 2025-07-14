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
    path = items.pop() as string;
  }
  const items1 = path.split(".");
  if (items1.length === 1) {
    return path;
  }
  return items1.slice(0, items1.length - 1).join(".");
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result as string);
    }
    fr.onerror = reject;
    fr.readAsText(file);
  })
}