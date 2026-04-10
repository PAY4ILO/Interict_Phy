import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../api/authService';
import { useToast } from '../contexts/ToastContext';

 
const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login } = useAuth();
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                const data = await authService.login(email, password);
                if (data.success) {
                    login(data.user);
                    showToast('Успешный вход!', 'success');
                    onClose();
                } else {
                    showToast(data.message, 'error');
                }
            } else {
                const data = await authService.register(email, password, name);
                if (data.success) {
                    showToast('Регистрация успешна! Теперь вы можете войти.', 'success');
                    setIsLogin(true);
                } else {
                    showToast(data.message, 'error');
                }
            }
        } catch (err) {
            console.error(err);
            showToast('Ошибка сети при авторизации.', 'error');
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
