import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './main.css';
import { ReduxProvider } from '@/store/ReduxProvider';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-jakarta',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Deep Focus Planner',
    description: 'Professional planning and productivity platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
            <body className="font-sans bg-slate-950 text-white antialiased selection:bg-blue-500/30">
                <ReduxProvider>{children}</ReduxProvider>
            </body>
        </html>
    );
}
