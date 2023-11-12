import { monserrat } from "../../ui/fonts";
import SideNav from '../../ui/dashboard/sidenav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
