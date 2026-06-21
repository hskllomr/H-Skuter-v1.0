import React from 'react';
import axios from 'axios';

function AutonomousPanel({ scooters, selectedScooterId, startPoint, endPoint, onClear }) {

    const startAutonomousTrip = async () => {
        if (!selectedScooterId) {
            alert("Lütfen haritadan otonom gitmesini istediğiniz skutere tıklayın!");
            return;
        }
        if (!startPoint || !endPoint) {
            alert("Lütfen haritada gitmek istediğiniz hedef (B) noktasını işaretleyin!");
            return;
        }

        const payload = {
            scooterId: selectedScooterId,
            userId: localStorage.getItem('userId'),
            startLat: startPoint.lat,
            startLng: startPoint.lng,
            endLat: endPoint.lat,
            endLng: endPoint.lng
        };

        try {
            const response = await axios.post('http://localhost:8080/api/v1/rentals/autonomous-request', payload);
            alert(`Otonom Sürüş Başlatıldı! Rota ID: ${response.data.id}`);
            onClear();
        } catch (error) {
            console.error("Otonom rota gönderilemedi:", error);
            alert("Otonom sürüş isteği gönderilirken bir hata oluştu.");
        }
    };

    return (
        <div style={panelStyle}>
            <h3 style={{ marginTop: 0, fontSize: '16px', color: '#2d3748' }}>🤖 Otonom Sistem Kontrolü</h3>
            <p style={{ fontSize: '12px', color: '#4a5568', margin: '0 0 10px 0' }}>
                Haritadan bir araca tıklayın. Ardından haritada boş bir yere tıklayarak hedef rotayı belirleyin.
            </p>

            <div style={{ fontSize: '13px', marginBottom: '8px', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
                <div><b>Seçili Araç:</b> {selectedScooterId ? `#${selectedScooterId}` : "Seçilmedi ❌"}</div>
                {startPoint && <div style={{ color: '#2b6cb0', fontSize: '12px', marginTop: '4px' }}>📍 A (Başlangıç): {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}</div>}
                {endPoint && <div style={{ color: '#2f855a', fontSize: '12px' }}>🎯 B (Hedef): {endPoint.lat.toFixed(4)}, {endPoint.lng.toFixed(4)}</div>}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={onClear} style={{ ...btnStyle, backgroundColor: '#a0aec0' }}>Temizle</button>
                <button onClick={startAutonomousTrip} style={{ ...btnStyle, backgroundColor: '#38a169' }}>Otonomu Başlat 🚀</button>
            </div>
        </div>
    );
}

const panelStyle = {
    padding: '15px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #cbd5e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const btnStyle = {
    padding: '8px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    flex: 1
};

export default AutonomousPanel;