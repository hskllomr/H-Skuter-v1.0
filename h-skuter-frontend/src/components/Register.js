import React, { useState } from "react";
import axios from "axios";
import '../App.css';

function Register({ onSwitch }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = (e) => {
        e.preventDefault();

        const registerData = {
            name: name,
            email: email,
            password: password
        };

        axios.post('http://localhost:8080/api/auth/register', registerData)
            .then(res => {
                alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
                onSwitch();
            })
            .catch(err => {
                console.error("Kayıt hatası:", err);
                setMessage("Kayıt sırasında bir hata oluştu. Bilgileri kontrol edin.");
            });
    };

    return (
        <div className="login-wrapper">
            <div className="login-cart">
                <div className="login-header">
                    <span style={{ fontSize: "50px" }}>🛴</span>
                    <h1>H-Skuter</h1>
                    <p>Yeni Hesap Oluşturun</p>
                </div>

                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        className="login-input"
                        placeholder="Ad Soyad"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        className="login-input"
                        placeholder="Email Adresiniz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ marginTop: "10px" }}
                        required
                    />

                    <input
                        type="password"
                        className="login-input"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginTop: "10px" }}
                        required
                    />

                    <button type="submit" className="login-button" style={{ marginTop: "20px" }}>
                        Kayıt Ol
                    </button>
                </form>

                <div className="login-body">
                    {message && <p style={{ color: "red", fontSize: "0.8rem" }}>{message}</p>}
                    <button
                        onClick={onSwitch}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            marginTop: "10px",
                            textDecoration: "underline"
                        }}
                    >
                        Zaten bir hesabınız var mı? Giriş Yapın
                    </button>
                    <br />
                    <small>© 2026 H-Skuter Projesi</small>
                </div>
            </div>
        </div>
    );
}

export default Register;