import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:{default:'ورق | فروشگاه تخصصی کاغذ',template:'%s | ورق'},description:'فروشگاه تخصصی کاغذ، انتخاب حرفه‌ای برای خرید عمده',robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html suppressHydrationWarning><body>{children}</body></html>}
