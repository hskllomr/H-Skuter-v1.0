import React from 'react';

const BatteryIndicator = ({ level }) => {
    const color = level > 50 ? '#2ecc71' : level > 20 ? '#f1c40f' : '#e74c3c';
    return (
        <div style={{ width: '100%', backgroundColor: '#edf2f7', borderRadius: '10px', height: '8px', marginTop: '8px' }}>
            <div style={{
                width: `${level}%`,
                backgroundColor: color,
                height: '100%',
                borderRadius: '10px',
                transition: 'width 0.5s ease'
            }} />
        </div>
    );
};

export default BatteryIndicator;