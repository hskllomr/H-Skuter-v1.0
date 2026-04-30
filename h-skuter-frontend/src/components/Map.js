import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Map({ scooters }) {
    const center = [38.7205, 35.4826];

    return (
        <div className="map-wrapper" style={{ height: "600px", width: "100%", border: "2px solid #ccc", borderRadius: "10px", overflow: "hidden" }}>
            <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {scooters && scooters.map(s => {
                    const lat = s.latitude;
                    const lng = s.longitude;

                    if (!lat || !lng) return null;

                    return (
                        <CircleMarker
                            key={s.id}
                            center={[lat, lng]}
                            radius={10}
                            pathOptions={{
                                color: s.status === 'AVAILABLE' ? '#2ecc71' : '#e74c3c',
                                fillColor: s.status === 'AVAILABLE' ? '#2ecc71' : '#e74c3c',
                                fillOpacity: 0.8
                            }}
                        >
                            <Popup>
                                <strong>{s.serialnumber}</strong><br/>
                                Batarya: %{s.batterylevel}<br/>
                                Durum: {s.status}<br/>
                                <small>ID: {s.id}</small>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

export default Map;