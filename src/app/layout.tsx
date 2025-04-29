import { ThemeProvider } from './themeContext'
import './globals.css'
import ClientOnly from './components/ClientOnly'
import ToasterProvider from './providers/ToasterProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientOnly>
          <ToasterProvider />
          <ThemeProvider>{children}</ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  )
}