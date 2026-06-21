import React from 'react';

const ScooterCard = ({ scooter }) => {
    const isAvailable = scooter.status === 'AVAILABLE' || scooter.status === 'Müsait';

    return (
        <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '15px',
            backgroundColor: '#fff',
            textAlign: 'left',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            marginBottom: '10px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2d3748' }}>{scooter.serialnumber}</h3>
                <span style={{ fontSize: '0.85rem', color: '#3182ce', fontWeight: '600', backgroundColor: '#ebf8ff', padding: '2px 8px', borderRadius: '10px' }}>
                    📍 {scooter.distance > 1000 ? `${(scooter.distance / 1000).toFixed(1)} km` : `${Math.round(scooter.distance)} m`}
                </span>
            </div>

            <span style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                backgroundColor: isAvailable ? '#c6f6d5' : '#fed7d7',
                color: isAvailable ? '#22543d' : '#822727'
            }}>
                {isAvailable ? 'Müsait' : 'Kullanımda'}
            </span>


        </div>
    );
};

export default ScooterCard;