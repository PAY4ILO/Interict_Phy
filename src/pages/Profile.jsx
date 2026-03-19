import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, Shield, Star, LogOut, Package } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    if (!user) {
        return <Navigate to="/" />;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Личный Кабинет
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Управление аккаунтом и подпиской</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

                {/* Account Details */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <User size={24} color="var(--primary)" /> Данные профиля
                    </h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                        <span style={{ fontWeight: 600 }}>{user.email}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Роль:</span>
                        <span style={{
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: user.role === 'admin' ? '#ef4444' : '#3b82f6'
                        }}>
                            {user.role === 'admin' ? 'Администратор' : 'Студент'}
                        </span>
                    </div>

                    <button
                        className="btn-secondary"
                        onClick={handleLogout}
                        style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.5)' }}
                    >
                        <LogOut size={18} /> Выйти из аккаунта
                    </button>
                </div>

                {/* Subscription Plan */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                    {user.plan === 'advanced' && <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--primary)', color: 'white', padding: '20px 40px', transform: 'rotate(45deg)', fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>PRO</div>}

                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <Package size={24} color="var(--primary)" /> Текущий Тариф
                    </h2>

                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: user.plan === 'advanced' ? '#f59e0b' : 'var(--text-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                            {user.plan === 'advanced' ? <><Star size={36} fill="#f59e0b" /> Premium</> : 'Базовый'}
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                            {user.plan === 'advanced'
                                ? 'Вам доступны все лабораторные работы и приватные симуляции.'
                                : 'У вас есть доступ только к бесплатным симуляциям (Механика).'
                            }
                        </p>
                    </div>

                    {user.plan === 'basic' && (
                        <button className="btn-primary" style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'linear-gradient(45deg, #f59e0b, #d97706)', border: 'none' }} onClick={() => showToast('Демо: интеграция с платежной системой в разработке.', 'info')}>
                            <Shield size={18} /> Улучшить до Premium
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
