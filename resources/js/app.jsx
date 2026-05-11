import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';

function App() {
    // Test direct de l'API
    fetch('https://digitlib-production.up.railway.app/api/genres')
        .then(res => res.json())
        .then(data => console.log('API response:', data))
        .catch(err => console.error('API error:', err));
    
    return (
        <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: 'orange' }}>DigiLib</h1>
            <p>L'application est chargée !</p>
            <p>Status: <span style={{ color: 'green' }}>✅ OK</span></p>
            <p>Ouvre la console pour voir les logs API</p>
            <button 
                onClick={() => fetch('https://digitlib-production.up.railway.app/api/libraries')
                    .then(r => r.json())
                    .then(data => alert('API Libraries: ' + JSON.stringify(data)))
                    .catch(e => alert('Error: ' + e.message))
                }
                style={{ padding: '10px 20px', background: 'orange', color: 'white', border: 'none', borderRadius: '10px' }}
            >
                Tester API Libraries
            </button>
        </div>
    );
}

createRoot(document.getElementById('app')).render(<App />);