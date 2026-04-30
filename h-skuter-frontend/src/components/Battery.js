const Battery = ({ scooters }) => {
    const total = scooters.length;
    const active = scooters.filter(s => s.status !== 'AVAILABLE').length;
    const lowBattery = scooters.filter(s => s.batterylevel < 20).length;

    return (
        <div className="stats-container">
            <div className="stat-box"><h3>Toplam</h3><p>{total}</p></div>
            <div className="stat-box active"><h3>Sürüşte</h3><p>{active}</p></div>
            <div className="stat-box low"><h3>Düşük Pil</h3><p>{lowBattery}</p></div>
        </div>
    );
};
export default Battery;