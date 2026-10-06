import type { Metadata } from 'next';
export const metadata: Metadata={title:'Đại Chiến Tri Thức PRO',description:'Đấu trường kiến thức dành cho lớp học của Đạt'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
