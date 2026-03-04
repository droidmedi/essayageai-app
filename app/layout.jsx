
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata = {
  title: 'EssayageAI - Essayez vos vêtements',
  description: 'Essayage virtuel par IA pour vos vêtements',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
