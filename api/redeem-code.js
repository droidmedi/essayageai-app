const { codesDB } = require('./paypal-webhook.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { code } = req.body;  // ← C'est la seule déstructuration autorisée
    if (!code) return res.status(400).json({ error: 'Code manquant' });
    
    if (!codesDB[code]) return res.status(400).json({ error: 'Code invalide' });
    if (codesDB[code].used) return res.status(400).json({ error: 'Code déjà utilisé' });
    
    codesDB[code].used = true;
    res.status(200).json({ tries: codesDB[code].tries, message: `${codesDB[code].tries} essais ajoutés !` });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};