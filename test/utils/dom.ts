// test/utils/dom.ts
export function getOutsideHelpModal<T extends HTMLElement>(
  getAllFn: () => T[]
): T {
  const el = getAllFn().find(el => !el.closest('[data-testid="help-modal"]'))
  if (!el) throw new Error('Element not found outside help-modal')
  return el
}
