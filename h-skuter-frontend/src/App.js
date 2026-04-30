import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import Login from './components/Login';
import Register from './components/Register';
import Battery from './components/Battery';
import BatteryIndicator from './components/BatteryIndicator';
import ScooterCard from './components/ScooterCard';
import Map from './components/Map';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371e3;
    const a = Math.sin((lat2 - lat1) * Math.PI / 180 / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin((lon2 - lon1) * Math.PI / 180 / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

function App() {
    const [currentView, setCurrentView] = useState('login');
    const [scooters, setScooters] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [currentRentalId, setCurrentRentalId] = useState(null);
    const [userPos, setUserPos] = useState({ lat: 38.7205, lng: 35.4826 });
    const [user, setUser] = useState({ id: null, name: "", balance: 0 });
    const stompClient = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');

        if (token && storedUserId) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setCurrentView('map');

            axios.get(`http://localhost:8080/api/v1/users/${storedUserId}`)
                .then(res => {
                    setUser(res.data);
                    fetchData(userPos.lat, userPos.lng);
                })
                .catch(err => console.error("Kullanıcı çekilemedi", err));
        }
    }, []);

    const fetchData = (lat, lng) => {
        axios.get(`http://localhost:8080/api/v1/scooters?lat=${lat}&lng=${lng}`)
            .then(res => {
                const data = res.data.map(s => ({
                    ...s,
                    distance: calculateDistance(lat, lng, s.latitude, s.longitude)
                }));
                setScooters(data.filter(s => s.serialnumber !== 'H-SKUT-01'));
            });
    };

    useEffect(() => {
        if (currentView !== 'map') return;

        const socket = new SockJS('http://localhost:8080/ws-hskuter');
        stompClient.current = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("WebSocket Bağlantısı Başarılı!");

                stompClient.current.subscribe('/topic/scooters', (msg) => {
                    const data = JSON.parse(msg.body);

                    if (data.serialnumber === 'H-SKUT-01') return;

                    console.log("Güncelleme Geldi (H-SKUT-01 Hariç):", data);

                    setScooters(prev => {
                        const exists = prev.find(s => s.id === data.id);

                        if (exists) {
                            return prev.map(s => {
                                if (s.id === data.id) {
                                    return {
                                        ...s,
                                        batterylevel: data.batterylevel,
                                        status: data.status,
                                        latitude: data.latitude,
                                        longitude: data.longitude,
                                        distance: calculateDistance(userPos.lat, userPos.lng, data.latitude, data.longitude)
                                    };
                                }
                                return s;
                            });
                        } else {
                            const newScooter = {
                                ...data,
                                distance: calculateDistance(userPos.lat, userPos.lng, data.latitude, data.longitude)
                            };
                            return [...prev, newScooter].sort((a, b) => a.distance - b.distance);
                        }
                    });
                });
            }
        });

        stompClient.current.activate();
        return () => stompClient.current && stompClient.current.deactivate();
    }, [currentView, userPos.lat, userPos.lng]);


    const addBalance = async (amount) => {
        if (!user || !user.id) {
            alert("Kullanıcı bilgileri yüklenemedi, lütfen sayfayı yenileyin.");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8080/api/v1/rentals/add-balance/${user.id}/${amount}`);
            setUser(response.data);
            alert(`${amount} TL başarıyla eklendi!`);
        } catch (error) {
            console.error("Bakiye eklenirken hata oluştu:", error);
        }
    };

    const handleLogin = (creds) => {
        const loginData = {
            email: creds.email,
            password: creds.password
        };

        console.log("Giriş denemesi yapılıyor:", loginData); // Debug için

        axios.post('http://localhost:8080/api/auth/login', loginData)
            .then(res => {
                const { token, id, name, balance } = res.data;

                localStorage.setItem('token', token);
                localStorage.setItem('userId', id);
                localStorage.setItem('userName', name);

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                setUser({ id, name, balance });

                setCurrentView('map');

                fetchData(38.7205, 35.4826);
            })
            .catch(err => {
                console.error("Giriş Hatası Detayı:", err.response?.data);
                alert("Giriş Başarısız: " + (err.response?.data || "Bilgilerinizi kontrol edin."));
            });
    };

    const startRide = (scooterId) => {
        if (!user || !user.id) return alert("Kullanıcı oturumu bulunamadı!");
        if (user.balance < 10) return alert("Bakiye yetersiz! (Min. 10 TL)");

        axios.post(`http://localhost:8080/api/v1/rentals/start/${scooterId}/${user.id}`, {})
            .then(res => {
                setCurrentRentalId(res.data.id);
                setActiveRide(res.data.scooter);
            }).catch(() => alert("Kiralama başlatılamadı!"));
    };

    const stopRide = () => {
        axios.post(`http://localhost:8080/api/v1/rentals/finish/${currentRentalId}`, {})
            .then(() => {
                const sabitUcret = 15.0;
                setUser(prev => ({ ...prev, balance: prev.balance - sabitUcret }));
                alert(`Sürüş bitti. Ücret: ${sabitUcret} TL düştü.`);
                setActiveRide(null);
                setCurrentRentalId(null);
                fetchData(userPos.lat, userPos.lng);
            });
    };


    return (
        <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
            {currentView === 'login' && <Login onLogin={handleLogin} onSwitch={() => setCurrentView('register')} />}
            {currentView === 'register' && <Register onSwitch={() => setCurrentView('login')} />}

            {currentView === 'map' && (
                <>

                    <header style={{ background: "#2d3748", color: "white", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1000 }}>
                        <h2 style={{ margin: 0 }}>🛴 H-SKUTER</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <span style={{ background: "#48bb78", padding: "5px 15px", borderRadius: "20px" }}>💰 {user.balance?.toFixed(2)} TL</span>
                            <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} style={{ background: "#f56565", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}>ÇIKIŞ</button>
                        </div>
                    </header>

                    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                        <aside style={{ width: "350px", borderRight: "1px solid #ddd", overflowY: "auto", padding: "20px", background: "#edf2f7" }}>


                            <div className="wallet-section" style={{ padding: '15px', backgroundColor: 'white', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginTop: 0, fontSize: '16px' }}>💳 Hızlı Bakiye Yükle</h3>
                                <div className="add-funds" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button onClick={() => addBalance(20)} style={btnStyle}>+20</button>
                                    <button onClick={() => addBalance(50)} style={btnStyle}>+50</button>
                                    <button onClick={() => addBalance(100)} style={btnStyle}>+100</button>
                                </div>
                            </div>

                            <Battery scooters={scooters} />

                            <h3 style={{ borderTop: "1px solid #cbd5e0", paddingTop: "15px" }}>Yakındaki Araçlar</h3>
                            {scooters.map(s => (
                                <div key={s.id} style={{ marginBottom: "15px" }}>
                                    <ScooterCard
                                        scooter={s}
                                        canFinish={activeRide && activeRide.id === s.id}
                                        onRent={() => startRide(s.id)}
                                        onFinish={stopRide}
                                    />
                                    <div style={{ marginTop: "-10px", padding: "0 15px 15px", background: "white", borderRadius: "0 0 12px 12px", border: "1px solid #e2e8f0", borderTop: "none" }}>
                                        <BatteryIndicator level={s.batterylevel} />
                                    </div>
                                </div>
                            ))}
                        </aside>


                        <main style={{ flex: 1 }}>
                            <Map scooters={scooters} />
                        </main>
                    </div>
                </>
            )}
        </div>
    );}


    const btnStyle = {
        padding: '8px 12px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        flex: 1
    };
export default App;