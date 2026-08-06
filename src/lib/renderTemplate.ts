export function renderTemplate(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(/\{\{([\w.]+)\}\}/g, (_, key: string) => {
    const parts = key.split('.');
    let val: unknown = context;
    for (const part of parts) {
      if (val == null || typeof val !== 'object') return '';
      val = (val as Record<string, unknown>)[part];
    }
    return val == null ? '' : String(val);
  });
}
