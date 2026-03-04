// api/paypal-webhook.js
const crypto = require('crypto');

// Stockage temporaire des codes (dans une vraie app, utilise une base de données)
const codesDB = {};

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    // PayPal envoie les données du paiement
    const paymentData = req.body;
    console.log("✅ Notification PayPal reçue:", paymentData);

    // Vérifier que le paiement est valide
    const { item_name, mc_gross, payer_email, tx } = paymentData;
    
    if (!item_name || !mc_gross || !payer_email) {
      throw new Error("Données de paiement incomplètes");
    }

    // Extraire le nombre d'essais depuis item_name (ex: "5 essais")
    const triesMatch = item_name.match(/(\d+)/);
    if (!triesMatch) throw new Error("Impossible de déterminer le nombre d'essais");
    
    const tries = parseInt(triesMatch[0]);

    // Générer un code unique (format: ESSAI-XXXX-XXXX)
    const code = 'ESSAI-' + crypto.randomBytes(4).toString('hex').toUpperCase().match(/.{1,4}/g).join('-');
    
    // Stocker le code en mémoire
    codesDB[code] = {
      tries,
      email: payer_email,
      used: false,
      createdAt: new Date(),
      paymentId: tx || 'unknown',
      amount: mc_gross
    };

    console.log(`✅ Code généré: ${code} pour ${tries} essais (${payer_email})`);

    // Fonction pour envoyer l'email via Brevo
    async function sendEmailViaBrevo(email, code, tries) {
      const apiKey = process.env.BREVO_API_KEY;
      
      if (!apiKey) {
        console.log("⚠️ BREVO_API_KEY non configurée, email non envoyé");
        return;
      }

      const emailContent = {
        sender: { 
          name: 'EssayageAI', 
          email: 'contact@essayageai.com' 
        },
        to: [{ email }],
        subject: `🎟️ Tes ${tries} essais EssayageAI sont prêts !`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Tes codes d'essai</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0;">🎉 Merci pour ton achat !</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="font-size: 18px; color: #333;">Bonjour,</p>
              <p style="font-size: 16px; color: #555;">Tu as acheté <strong>${tries} essais</strong> pour EssayageAI. Voici ton code d'activation :</p>
              
              <div style="background: #2d3748; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #48bb78; letter-spacing: 4px;">${code}</span>
              </div>
              
              <p style="font-size: 16px; color: #555;">Comment utiliser ton code :</p>
              <ol style="color: #555; line-height: 1.8;">
                <li>Rends-toi sur <a href="https://essayageai-app.vercel.app" style="color: #4299e1; text-decoration: none;">EssayageAI</a></li>
                <li>Dans la section "Vous avez un code ?", entre ton code</li>
                <li>Clique sur "Valider" pour activer tes ${tries} essais</li>
                <li>Commence à essayer des vêtements !</li>
              </ol>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404;">
                  <strong>⚠️ Important :</strong> Chaque code ne peut être utilisé qu'une seule fois. 
                  Garde-le précieusement !
                </p>
              </div>
              
              <p style="color: #777; font-size: 14px; text-align: center; margin-top: 40px;">
                EssayageAI - Essayez vos vêtements avant de les acheter<br>
                <a href="https://essayageai.com" style="color: #4299e1; text-decoration: none;">essayageai.com</a>
              </p>
            </div>
          </body>
          </html>
        `
      };

      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailContent)
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Erreur Brevo: ${error}`);
        }

        console.log(`✅ Email envoyé à ${email}`);
      } catch (error) {
        console.error('❌ Erreur envoi email:', error);
      }
    }

    // Envoyer l'email
    await sendEmailViaBrevo(payer_email, code, tries);

    // Répondre à PayPal pour confirmer la réception
    res.status(200).json({ 
      success: true,
      message: "Code généré et email envoyé",
      code: code,
      tries: tries
    });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(500).json({ error: error.message });
  }
};

// Exposer codesDB pour l'API redeem (dans une vraie app, utilise une base de données)
module.exports.codesDB = codesDB;