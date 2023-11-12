import '@/app/ui/global.css'
import { monserrat } from "@/app/ui/fonts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${monserrat.className} antialiased`} >
        {children}
      </body>
    </html>
  );
}
