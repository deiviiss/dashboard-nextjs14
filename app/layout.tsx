import '@/app/ui/global.css'
import { monserrat } from '@/app/ui/fonts'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme',
    default: 'Acme',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${monserrat.className} antialiased`} >
        {children}
      </body>
    </html>
  )
}
