// api/create-payment.js
export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { tries, price } = req.body;

    // Construire l'URL PayPal (version simplifiée)
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=TON_EMAIL_PAYPAL@EMAIL.COM&item_name=${tries}%20essais%20EssayageAI&amount=${price}&currency_code=EUR&return=https://essayageai-app.vercel.app/success&cancel_return=https://essayageai-app.vercel.app`;

    res.status(200).json({ paypalUrl });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}