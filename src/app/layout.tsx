import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'MUST IRB System',
  description: 'ШУТИС-ийн Ёс зүйн хорооны систем',
};

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
