import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const scooterIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function Map({ scooters, lastCompletedScooterId }) {
    const [selectedScooter, setSelectedScooter] = useState(null);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [isDriving, setIsDriving] = useState(false);

    useEffect(() => {
        if (lastCompletedScooterId) {
            console.log(`🎯 #${lastCompletedScooterId} nolu aracın sürüşü bitti/durdu. Harita temizleniyor...`);
            setSelectedScooter(null);
            setStartPoint(null);
            setEndPoint(null);
            setIsDriving(false);
        }
    }, [lastCompletedScooterId]);

    function MapClickHandler() {
        useMapEvents({
            click(e) {
                if (!selectedScooter || isDriving) return;
                setEndPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
                console.log("Bitiş Noktası (B) Seçildi:", e.latlng);
            },
        });
        return null;
    }

    const handleStartAutonomousTrip = () => {
        if (!selectedScooter || !startPoint || !endPoint) {
            alert("Lütfen bir skuter seçin ve haritaya tıklayarak bir bitiş noktası belirleyin!");
            return;
        }

        const tripData = {
            scooterId: selectedScooter.id,
            startLat: startPoint.lat,
            startLng: startPoint.lng,
            endLat: endPoint.lat,
            endLng: endPoint.lng,
            status: "IN_PROGRESS"
        };

        setIsDriving(true);

        axios.post('http://localhost:8080/api/v1/rentals/autonomous-request', tripData)
            .then(res => {
                console.log("Otonom sürüş başarıyla tetiklendi:", res.data);
            })
            .catch(err => {
                console.error("Otonom sürüş başlatılırken hata oluştu:", err);
                setIsDriving(false);
                alert("Otonom sürüş başlatılamadı!");
            });
    };

    const handleCancelAutonomousTrip = () => {
        if (!selectedScooter) return;

        axios.post(`http://localhost:8080/api/v1/rentals/autonomous-cancel/${selectedScooter.id}`)
            .then(res => {
                console.log("Otonom iptal sinyali gönderildi:", res.data);
            })
            .catch(err => {
                console.error("Otonom bitirilirken hata oluştu:", err);
                alert("Otonom sürüş durdurulamadı!");
            });
    };

    const handleScooterSelect = (scooter) => {
        if (isDriving) return;
        setSelectedScooter(scooter);
        setStartPoint({ lat: scooter.latitude, lng: scooter.longitude });
        setEndPoint(null);
        console.log(`Haritadan Skuter #${scooter.id} seçildi.`);
    };

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <MapContainer center={[38.7205, 35.4826]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {scooters.map(scooter => (
                    <Marker
                        key={scooter.id}
                        position={[scooter.latitude, scooter.longitude]}
                        icon={scooterIcon}
                        eventHandlers={{
                            click: () => handleScooterSelect(scooter)
                        }}
                    >
                        <Popup>
                            <strong>{scooter.serialnumber}</strong> <br />
                            Durum: {scooter.status} <br />
                            Batarya: %{scooter.batterylevel}
                        </Popup>
                    </Marker>
                ))}

                {startPoint && (
                    <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
                        <Popup>Başlangıç Noktası (A)</Popup>
                    </Marker>
                )}

                {endPoint && (
                    <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon}>
                        <Popup>Bitiş Noktası (B)</Popup>
                    </Marker>
                )}

                {startPoint && endPoint && (
                    <Polyline positions={[[startPoint.lat, startPoint.lng], [endPoint.lat, endPoint.lng]]} color="blue" dashArray="5, 10" />
                )}

                <MapClickHandler />
            </MapContainer>

            {selectedScooter && (
                <div style={{
                    position: 'absolute', top: '20px', right: '20px', backgroundColor: 'white',
                    padding: '15px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000, width: '260px'
                }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>🤖 Otonom Sürüş Paneli</h4>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Seçili:</strong> {selectedScooter.serialnumber}</p>
                    <p style={{ margin: '5px 0', fontSize: '13px', color: isDriving ? 'blue' : (endPoint ? 'green' : 'orange') }}>
                        {isDriving ? '🚀 Sürüş Devam Ediyor...' : (endPoint ? '✅ Hedef Seçildi' : '📍 Haritadan hedef (B) noktası seçin')}
                    </p>

                    {!isDriving ? (
                        <button
                            onClick={handleStartAutonomousTrip}
                            disabled={!endPoint}
                            style={{
                                width: '100%', padding: '10px',
                                backgroundColor: endPoint ? '#4ea8de' : '#cbd5e0',
                                color: 'white', border: 'none', borderRadius: '5px',
                                cursor: endPoint ? 'pointer' : 'not-allowed', fontWeight: 'bold', marginTop: '10px'
                            }}
                        >
                            Otonomu Başlat 🚀
                        </button>
                    ) : (
                        <button
                            onClick={handleCancelAutonomousTrip}
                            style={{
                                width: '100%', padding: '10px',
                                backgroundColor: '#e63946',
                                color: 'white', border: 'none', borderRadius: '5px',
                                cursor: 'pointer', fontWeight: 'bold', marginTop: '10px'
                            }}
                        >
                            Otonomu Bitir 🛑
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default Map;