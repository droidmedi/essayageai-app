export default function HomePage() {
  return (
    <html>
      <head>
        <title>Test</title>
      </head>
      <body style={{ margin: 0, padding: 20, fontFamily: 'Arial' }}>
        <h1>🔴 TEST SIMPLE</h1>
        <p>Si tu vois cette page, Next.js fonctionne !</p>
        <p>Heure actuelle : {new Date().toLocaleTimeString()}</p>
      </body>
    </html>
  )
}
