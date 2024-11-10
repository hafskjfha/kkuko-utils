import type { NextApiRequest, NextApiResponse } from "next";
import CombinationManager from "../../utils/ts/CombinationsManger";
//import CombinationManager from "@/utils/ts/ct";
import * as fs from 'fs';
import * as path from 'path';

type Data = {
  p: string[];
};

// 파일을 비동기적으로 읽는 함수
async function readFileAsync(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject('파일 읽기 오류: ' + err);
      } else {
        resolve(data.split('\n'));
      }
    });
  });
}

async function tt() {
  let rs: string[] = [];
  const startTime = performance.now();
  const kk =
    "가객객객객것게게격겹고곡곡곤곶관관교구구굴기기기끌끔나나나나나나나난낭넘네녀년느는니다단단단담대대댕댕더독동동두둑둑득디딘딱뛰라락래랙램렌령루르름리리리리리립릿마마마멍며면면면명묘묘문바바바박배배뱀버범범법보복봄봇불불브브빛뻑사사사사사샅생선섯성세션션쇼수수수순슛스스스스스스슴시식싱아아아아악암압앙약업에오요육을을을의의이이이인잇잔잡쟌정정제족족종좋죄죄주준쥭즘즙지지짚찜차차차찬촉츠층층층층층치칙친친컬코코코크크클키킨킵타타타탈탕터토톤톤톤트트트틀틀틴파파판팬펠포폰푸풀품프프프한한합핸험험호화화화화";
  const filePath = path.join(__dirname, 'len6_words_listA.txt');
  
  try {
    // 비동기적으로 파일을 읽기
    const dataa = await readFileAsync(filePath);
    const manager = new CombinationManager(kk, dataa);
    //const r:string[]=[]
    const r = manager.getBests();
    // manager.findPossibleWords();
    // if (manager.hasPossibleWord()) {
    //     manager.counts();
    //     while (manager.hasPossibleWord()) {
    //         manager.countWord();
    //         const best = manager.getBestAndRemove();
    //         r.push(best);
    //         manager.findPossibleWords();
    //     }

    // } else {
    //     console.log('No possible words found.')
    //     r.push('No possible words found.');
    // }
    console.log(r);
    console.log(r.length);
    console.log(performance.now() - startTime);
    rs = r;
  } catch (err) {
    console.error(err);
  }
  
  return rs;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const i = await tt();
  res.status(200).json({ p: i });
}
