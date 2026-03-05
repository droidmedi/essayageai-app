// api/tryon.js - VERSION TEST
module.exports = async (req, res) => {
    // Configuration CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://essayageai-app.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        // Simuler une réponse réussie
        return res.status(200).json({ 
            imageUrl: 'https://images.unsplash.com/photo-1542293787938-c9e299b880cc?w=400'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
