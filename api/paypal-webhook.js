// api/paypal-webhook.js
const crypto = require('crypto');

// Stockage temporaire des codes
const codesDB = {};

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const paymentData = req.body;
    console.log("✅ Notification PayPal reçue:", paymentData);

    const { item_name, mc_gross, payer_email, tx } = paymentData;
    
    if (!item_name || !mc_gross || !payer_email) {
      throw new Error("Données de paiement incomplètes");
    }

    const triesMatch = item_name.match(/(\d+)/);
    if (!triesMatch) throw new Error("Impossible de déterminer le nombre d'essais");
    
    const tries = parseInt(triesMatch[0]);

    // Générer un code unique
    const code = 'ESSAI-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Stocker le code
    codesDB[code] = {
      tries,
      email: payer_email,
      used: false,
      createdAt: new Date(),
      paymentId: tx || 'unknown',
      amount: mc_gross
    };

    console.log(`✅ Code généré: ${code} pour ${tries} essais`);

    res.status(200).json({ 
      success: true,
      code: code,
      tries: tries
    });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(500).json({ error: error.message });
  }
};

// Exposer codesDB pour les autres fichiers
module.exports.codesDB = codesDB;
