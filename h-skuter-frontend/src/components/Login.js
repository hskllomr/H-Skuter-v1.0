import React, { useState } from "react";
import '../App.css';

function Login({ onLogin, onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim() && password.trim()) {
            onLogin({
                email: email,
                username: email,
                password: password
            });
        } else {
            alert("Lütfen mail adresinizi ve şifrenizi giriniz.");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-cart">
                <div className="login-header">
                    <span style={{ fontSize: "50px" }}>🛴</span>
                    <h1>H-Skuter</h1>
                    <p>Giriş Yapın</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="login-input"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                    />
                    <input
                        type="password"
                        className="login-input"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginTop: "10px" }}
                    />
                    <button type="submit" className="login-button" style={{ marginTop: "20px" }}>
                        Giriş Yap
                    </button>
                </form>

                <div className="login-body">
                    <button
                        onClick={onSwitch}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            marginTop: '15px',
                            textDecoration: 'underline'
                        }}
                    >
                        Hesabınız yok mu? Kayıt Olun
                    </button>
                    <br />
                    <small>© 2026 H-Skuter Projesi</small>
                </div>
            </div>
        </div>
    );
}

export default Login;