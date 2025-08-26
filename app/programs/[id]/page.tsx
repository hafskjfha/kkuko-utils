import { Metadata } from 'next';
import ProgramDetailPage from './ProgramDetailPage';

export const metadata: Metadata = {
  title: '프로그램 상세 정보 - Kkuko Utils',
  description: '프로그램의 상세 정보와 릴리즈 히스토리를 확인하고 다운로드하세요.',
};

export default function Page() {
  return <ProgramDetailPage />;
}
