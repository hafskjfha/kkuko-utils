import { disassemble, assemble } from 'es-hangul';

const ch_list1 = ['ㅏ','ㅐ','ㅗ','ㅚ','ㅜ','ㅡ'] //두음 1
const ch_list2 = ['ㅑ','ㅕ','ㅖ','ㅛ','ㅠ','ㅣ'] //두음 2
const ch_list3 = ['ㅕ','ㅛ','ㅠ','ㅣ'] //두음 3

/**
 * 두음법칙 함수
 * 
 * @param c - 한글자 단어
 * @returns - 두음법칙 적용된 글자
 * @throws - 한글자가 아닌 경우 에러 발생
 */
export default function DuemLaw(c:string): string {
    if (c.length !== 1) {
        throw new Error('한글자만 입력해주세요');
    }
    
    const jamos_list = disassemble(c).split('');
    if (jamos_list.length < 2) return c;
    if (ch_list1.includes(assemble([jamos_list[1],jamos_list[2]])[0]) && jamos_list[0] == 'ㄹ'){
        jamos_list[0] = 'ㄴ'
    }
    else if ((ch_list2.includes(assemble([jamos_list[1],jamos_list[2]])[0]) && jamos_list[0] == 'ㄹ') || (ch_list3.includes(assemble([jamos_list[1],jamos_list[2]])[0]) && jamos_list[0] == 'ㄴ')) {
        jamos_list[0] = 'ㅇ'
    } 
    return assemble(jamos_list);
}

export function reverDuemLaw(c: string): string[]{
    if (c.length !== 1) {
        throw new Error('한글자만 입력해주세요');
    }
    const jamos_list = disassemble(c).split('');
    const reversDuemLetter: string[] = [c];
    if (jamos_list.length < 2) return reversDuemLetter;

    if (jamos_list[0] == 'ㄴ' && jamos_list[1] in ch_list1){
        jamos_list[0] = 'ㄹ'
        const i_letter = assemble(jamos_list)
        reversDuemLetter.push(i_letter)
        jamos_list[0] = 'ㄴ'
    }
    if (jamos_list[0] == 'ㅇ' && jamos_list[1] in ch_list2){
        jamos_list[0] = 'ㄹ'
        const i_letter = assemble(jamos_list)
        reversDuemLetter.push(i_letter)
        jamos_list[0] = 'ㅇ'
    }
    if (jamos_list[0] == 'ㅇ' && jamos_list[1] in ch_list3){
        jamos_list[0] = 'ㄴ'
        const i_letter = assemble(jamos_list)
        reversDuemLetter.push(i_letter)
        jamos_list[0] = 'ㅇ'
    }

    return reversDuemLetter

}