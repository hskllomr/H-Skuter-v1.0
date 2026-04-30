import React from 'react';

const ScooterCard = ({ scooter, onRent, onFinish, canFinish }) => {
    const isAvailable = scooter.status === 'AVAILABLE';

    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px 12px 0 0', padding: '15px', backgroundColor: '#fff', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2d3748' }}>{scooter.serialnumber}</h3>
                <span style={{ fontSize: '0.85rem', color: '#3182ce', fontWeight: '600', backgroundColor: '#ebf8ff', padding: '2px 8px', borderRadius: '10px' }}>
                    📍 {scooter.distance > 1000 ? `${(scooter.distance / 1000).toFixed(1)} km` : `${Math.round(scooter.distance)} m`}
                </span>
            </div>

            <span style={{
                padding: '4px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                backgroundColor: isAvailable ? '#c6f6d5' : '#fed7d7',
                color: isAvailable ? '#22543d' : '#822727'
            }}>
                {isAvailable ? 'Müsait' : 'Kullanımda'}
            </span>

            <div style={{ marginTop: '15px' }}>
                {isAvailable ? (
                    <button onClick={onRent} style={{ width: '100%', padding: '10px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Kiralamayı Başlat 🛴
                    </button>
                ) : (
                    canFinish ? (
                        <button onClick={onFinish} style={{ width: '100%', padding: '10px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Sürüşü Bitir 🛑
                        </button>
                    ) : (
                        <button disabled style={{ width: '100%', padding: '10px', backgroundColor: '#cbd5e0', color: '#718096', border: 'none', borderRadius: '8px', cursor: 'not-allowed' }}>
                            Kullanımda 🔒
                        </button>
                    )
                )}
            </div>
        </div>
    );
};
export default ScooterCard;