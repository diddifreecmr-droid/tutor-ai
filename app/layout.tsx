import './globals.css';

export const metadata = { title: 'Tutor AI Cameroun', description: 'Ton compagnon de révision en français.', manifest: '/manifest.webmanifest' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
