import { AuthProvider } from '../src/context/AuthContext';
import './globals.css'; // эсвэл танай globals.css-ийн зам

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}