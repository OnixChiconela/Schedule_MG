
import { ThemeProvider } from './themeContext'
import './globals.css'
import ClientOnly from './components/ClientOnly'
import ToasterProvider from './providers/ToasterProvider'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scheuor',
  description: 'Manage your destiny.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  console.log('GA Tracking ID:', gaTrackingId, 'Track it')
  return (
    <html lang="en">
      <head>
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
        <ClientOnly>
          <ToasterProvider />
          <ThemeProvider>{children}</ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  )
}