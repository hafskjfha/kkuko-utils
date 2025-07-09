import { disassemble } from "es-hangul";

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

/**
 * 단어 초성 반환 함수
 * 
 * @param word 단어
 * @returns 단어의 초성
 */
export function calculateKoreanInitials(word: string): string{
    return word.split("").map((c) => disassemble(c)[0]).join("");
} 

/**
 * 문자열에 해당 문자가 몇개 들어있는지 반환하는 함수
 * 
 * @param a 검사당할 피 문자열
 * @param target 찾을 문자열
 * @returns target의 포함 개수
 */
export function count(a: string, target: string): number{
    return (a.match(new RegExp(target, "gi")) || []).length
}