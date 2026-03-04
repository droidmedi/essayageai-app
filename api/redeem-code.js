// api/redeem-code.js
const { codesDB } = require('./webhook');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        const { code } = req.body;
        
        if (!code) return res.status(400).json({ error: 'Code manquant' });

        if (!codesDB[code]) return res.status(400).json({ error: 'Code invalide' });
        if (codesDB[code].used) return res.status(400).json({ error: 'Code déjà utilisé' });

        codesDB[code].used = true;

        res.json({ 
            tries: codesDB[code].tries, 
            message: `${codesDB[code].tries} essais ajoutés !` 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
