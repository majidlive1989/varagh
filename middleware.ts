import {NextRequest,NextResponse} from 'next/server';
export function middleware(request:NextRequest){const path=request.nextUrl.pathname;if(path==='/' ){return NextResponse.redirect(new URL('/fa',request.url));}if(/^\/(fa|en)(\/|$)/.test(path))return NextResponse.next();return NextResponse.next();}
export const config={matcher:['/']};
