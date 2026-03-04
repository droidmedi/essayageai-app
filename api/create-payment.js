// api/create-payment.js
module.exports = async (req, res) => {
  // Configuration CORS pour permettre à ton site d'appeler l'API
  res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer la pré-vérification CORS (requête OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que c'est bien une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer les informations envoyées par le frontend
    const { tries, price } = req.body;
    
    console.log("✅ Demande de paiement reçue:", { tries, price });

    // Ton email PayPal (configuré)
    const PAYPAL_EMAIL = "mehdimedi555@gmail.com";
    
    // Construction de l'URL PayPal
    // cmd=_xclick : signifie "achat unique"
    // business : ton email PayPal
    // item_name : nom du produit
    // amount : montant
    // currency_code : EUR (euros)
    // return : page après paiement réussi
    // cancel_return : page si annulation
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${PAYPAL_EMAIL}&item_name=${tries}%20essais%20EssayageAI&amount=${price}&currency_code=EUR&return=https://essayageai-app.vercel.app/success&cancel_return=https://essayageai-app.vercel.app`;

    console.log("🔗 URL PayPal générée:", paypalUrl);

    // Renvoyer l'URL PayPal au frontend
    res.status(200).json({ paypalUrl });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ error: error.message });
  }
};
