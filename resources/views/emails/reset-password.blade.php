<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Réinitialisation du mot de passe</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333;">DigiLib</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-top: 0;">Réinitialisation du mot de passe</h2>
            
            <p style="color: #666; line-height: 1.6;">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $resetUrl }}" style="background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Réinitialiser mon mot de passe
                </a>
            </div>
            
            <p style="color: #666; font-size: 12px;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                Ce lien expire dans 60 minutes.
            </p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px;">
                DigiLib - Bibliothèque Numérique
            </p>
        </div>
    </div>
</body>
</html>