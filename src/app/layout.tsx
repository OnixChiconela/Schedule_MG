
import { ThemeProvider } from './themeContext'
import './globals.css'
import ClientOnly from './components/ClientOnly'
import ToasterProvider from './providers/ToasterProvider'
import { Metadata } from 'next';
import { SubfolderProvider } from './context/SubfolderContext';
import { LocationProvider } from './context/LocationContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationSocketProvider } from './context/ws/NotificationSocketContext';
import { Nunito_Sans } from "next/font/google"

export const metadata: Metadata = {
  title: 'Scheuor',
  description: 'Manage your destiny.',
};

const font = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="12x12" href="/scheuor_logo.png" />
        {gaTrackingId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', '${gaTrackingId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={font.className}>
        <UserProvider>
          <ClientOnly>
            <ToasterProvider />
            <NotificationProvider>
              <LocationProvider>
                <ThemeProvider>
                  <SubfolderProvider>
                    {children}
                  </SubfolderProvider>
                </ThemeProvider>
              </LocationProvider>
            </NotificationProvider>
          </ClientOnly>
        </UserProvider>
      </body>
    </html>
  )
}