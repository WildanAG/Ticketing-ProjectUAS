import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const roleRoutes = {
    '/admin_page': ['admin'],
    '/eventOrganizer_page': ['eo'] 
};

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    const matchedPrefix = Object.keys(roleRoutes).find(prefix => pathname.startsWith(prefix));

    if (!matchedPrefix) return NextResponse.next();

    const token = req.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (!roleRoutes[matchedPrefix].includes(payload.role)) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        console.log(payload)
        return NextResponse.next();
    } catch (err) {
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: ['/admin_page/:path*', '/eventOrganizer_page/:path*']
};