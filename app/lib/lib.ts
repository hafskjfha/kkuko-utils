export function isNoin(themes: string[]): boolean{
    const ttt = Array.from({ length: 54 }, (_, i) => (i * 10).toString());
    return ttt.some(v => themes.includes(v));
}