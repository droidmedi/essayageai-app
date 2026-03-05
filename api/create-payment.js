module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { tries, price } = req.body;  // ← Seule déstructuration
    const PAYPAL_EMAIL = "mehdimedi555@gmail.com";
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${PAYPAL_EMAIL}&item_name=${tries}%20essais%20EssayageAI&amount=${price}&currency_code=EUR&return=https://essayageai-app.vercel.app/success&cancel_return=https://essayageai-app.vercel.app`;
    
    res.status(200).json({ paypalUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};