import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                // actual call to /api/login.php
                const res = await axios.post('/api/login.php', { email, hash: password });
                if (res.data.success) {
                    login(res.data.user);
                    onClose();
                } else {
                    alert('Login failed: ' + res.data.message);
                }
            } else {
                const res = await axios.post('/api/register.php', { email, hash: password, name });
                if (res.data.success) {
                    alert('Registration successful! Please login.');
                    setIsLogin(true);
                } else {
                    alert('Registration failed: ' + res.data.message);
                }
            }
        } catch (err) {
            alert('Network error during authentication.');
        }
    };

    // Mocking the admin login for convenience. In reality admin is kiduakov321@gmail.com
    const forceAdminLogin = () => {
        login({ email: 'kiduakov321@gmail.com', role: 'admin' });
        onClose();
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={onClose}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ marginTop: 0 }}>{isLogin ? 'Вход' : 'Регистрация'}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '5px' }}>Имя</label>
                            <input type="text" className="input-premium" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '5px' }}>Email</label>
                        <input type="email" className="input-premium" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '5px' }}>Пароль</label>
                        <input type="password" className="input-premium" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '15px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
                </p>

                <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={forceAdminLogin}>
                        [ТЕСТ] Войти как Администратор
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
