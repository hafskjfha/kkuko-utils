/**
 * 노인정 단어인지 주제보고 추론하는 함수
 * 
 * @param themes 주제목록 (코드)
 * @returns 노인정 여부
 */
export function isNoin(themes: string[]): boolean{
    const ttt = Array.from({ length: 54 }, (_, i) => (i * 10).toString());
    return ttt.some(v => themes.includes(v));
}