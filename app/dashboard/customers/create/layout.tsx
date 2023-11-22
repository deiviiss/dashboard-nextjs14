import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create customer',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}
