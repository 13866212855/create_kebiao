import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: '教师周课程表生成系统 - 课表编排与Excel导出',
  description: '专为教师量身打造的个人周课程表制作系统，支持自定义作息节次、高亮配色、一键复制整日排课、Excel高保真导出与打印预览。',
  openGraph: {
    title: '教师周课程表生成系统',
    description: '专为教师量身打造的个人周课程表制作系统，支持自定义作息节次、高亮配色、一键复制整日排课、Excel高保真导出与打印预览。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '教师周课程表生成系统',
    description: '专为教师量身打造的个人周课程表制作系统，支持自定义作息节次、高亮配色、一键复制整日排课、Excel高保真导出与打印预览。',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
