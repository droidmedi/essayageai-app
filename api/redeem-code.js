// api/redeem-code.js
// Version simplifiée sans dépendance externe
const codesDB = {};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code manquant' });

    // Pour l'instant, on simule une validation
    // À remplacer par une vraie base de données plus tard
    if (code === 'TEST123') {
      return res.status(200).json({ tries: 5, message: "5 essais ajoutés !" });
    }

    return res.status(400).json({ error: 'Code invalide' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
