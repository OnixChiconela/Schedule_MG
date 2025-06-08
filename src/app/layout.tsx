
import { ThemeProvider } from './themeContext'
import './globals.css'
import ClientOnly from './components/ClientOnly'
import ToasterProvider from './providers/ToasterProvider'
import { Metadata } from 'next';
import { SubfolderProvider } from './context/SubfolderContext';
import { LocationProvider } from './context/LocationContext';
import { UserProvider } from './context/UserContext';

export const metadata: Metadata = {
  title: 'Scheuor',
  description: 'Manage your destiny.',
};

// const font = Nunito_Sans({
//   subsets: ['latin'],
//   weight: ['300', '400', '500', '600', '700'],
//   style: ['normal', 'italic'],
// });

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
      <body>
        <UserProvider>
          <ClientOnly>
            <ToasterProvider />
            <LocationProvider>
              <ThemeProvider>
                <SubfolderProvider>
                  {children}
                </SubfolderProvider>
              </ThemeProvider>
            </LocationProvider>
          </ClientOnly>
        </UserProvider>
      </body>
    </html>
  )
}