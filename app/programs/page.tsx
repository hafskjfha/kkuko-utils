import { Metadata } from 'next';
import ProgramsPage from './ProgramsPage';

export const metadata: Metadata = {
  title: '프로그램 모음 - Kkuko Utils',
  description: '끄코에서 사용할 수 있는 다양한 프로그램들을 다운로드하고 최신 릴리즈 정보를 확인하세요.',
  keywords: ['끄투코리아', '프로그램', '다운로드', '릴리즈', '게임도구', '유틸리티'],
};

export default function Page() {
  return <ProgramsPage />;
}
