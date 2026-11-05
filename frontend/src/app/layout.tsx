import type { Metadata } from 'next';
import './globals.css';
import { TranslationProvider } from '@/lib/translations';

export const metadata: Metadata = {
  title: 'HRSystem - Cloud HRIS & Payroll Platform (Egypt & Saudi Arabia)',
  description: 'Enterprise Multi-tenant Human Resources System with Biometrics, GPS Geofencing & Statutory Payroll',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}

