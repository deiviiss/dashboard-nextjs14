// import SideNav from '../../ui/dashboard/sidenav'
// import { monserrat } from '../../ui/fonts'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme',
    default: 'Invoices',
  }
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
