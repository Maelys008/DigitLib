<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérifiez votre compte DigiLib</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f1f5f9;
            padding: 20px;
        }
        
        .email-container {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .header {
            background: #ffffff;
            padding: 32px 28px 16px;
            text-align: center;
            border-bottom: 1px solid #eef2ff;
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: #1e1e2f;
            letter-spacing: -0.3px;
        }
        
        .header h1 {
            font-size: 26px;
            font-weight: 600;
            margin-top: 20px;
            margin-bottom: 8px;
            color: #0f172a;
        }
        
        .header p {
            color: #475569;
            font-size: 14px;
        }
        
        .content {
            padding: 32px 28px;
        }
        
        .welcome-text {
            font-size: 15px;
            line-height: 1.5;
            color: #334155;
            margin-bottom: 28px;
        }
        
        .verification-box {
            background: #f8fafc;
            border-radius: 16px;
            padding: 28px 20px;
            text-align: center;
            margin: 24px 0;
        }
        
        .code-label {
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            margin-bottom: 12px;
        }
        
        .verification-code {
            font-size: 40px;
            font-weight: 700;
            letter-spacing: 6px;
            color: #0f172a;
            font-family: monospace;
            background: white;
            padding: 12px 16px;
            border-radius: 12px;
            display: inline-block;
            margin: 8px 0 12px;
            border: 1px solid #e2e8f0;
        }
        
        .code-expiry {
            font-size: 12px;
            color: #64748b;
        }
        
        .button-container {
            text-align: center;
            margin: 32px 0 24px;
        }
        
        .verify-button {
            display: inline-block;
            background: #0f172a;
            color: white;
            text-decoration: none;
            padding: 12px 32px;
            border-radius: 40px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        
        .verify-button:hover {
            background: #1e293b;
        }
        
        .footer {
            background: #fafcff;
            padding: 24px 28px;
            text-align: center;
            border-top: 1px solid #eef2ff;
        }
        
        .security-note {
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 16px;
        }
        
        .copyright {
            font-size: 10px;
            color: #94a3b8;
        }
        
        @media (max-width: 560px) {
            body {
                padding: 12px;
            }
            
            .header, .content, .footer {
                padding-left: 20px;
                padding-right: 20px;
            }
            
            .verification-code {
                font-size: 32px;
                letter-spacing: 4px;
            }
            
            .verify-button {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-text">DigiLib</div>
            <h1>Bienvenue sur DigiLib</h1>
            <p>Votre bibliothèque numérique</p>
        </div>
        
        <div class="content">
           <p class="welcome-text">
                Bonjour <strong>Cher utilisateur </strong>,<br><br>
                Merci de rejoindre DigiLib ! Pour finaliser votre inscription, veuillez vérifier votre adresse email.<br>
                <strong>{{ $email }}</strong>
            </p>

            
            <div class="verification-box">
                <div class="code-label">Code de vérification</div>
                <div class="verification-code">{{ $code }}</div>
                <p class="code-expiry">Ce code expire dans 2 minutes</p>
            </div>
            
            <div class="button-container">
                <a href="{{ config('app.frontend_url', 'http://localhost:8000') }}/verify-otp?email={{ urlencode($email ?? '') }}" class="verify-button">
                    Vérifier mon compte
                </a>
            </div>
            
            <div class="alternative-method">
                <p style="font-size: 13px; color: #475569;">Ou saisissez ce code dans l'application : <strong style="font-size: 18px; letter-spacing: 2px;">{{ $code }}</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <div class="security-note">
                Email sécurisé · Votre code est confidentiel
            </div>
            <div class="copyright">
                © {{ date('Y') }} DigiLib. Tous droits réservés.
            </div>
        </div>
    </div>
</body>
</html>