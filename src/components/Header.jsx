import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Sun, Moon, Atom, LogIn, User, Settings } from 'lucide-react';
import AuthModal from './AuthModal';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800 }}>
                <Atom size={28} /> Physics Lab
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Каталог</Link>

                {user?.role === 'admin' && (
                    <Link to="/admin" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Settings size={18} /> Управление
                    </Link>
                )}

                <button className="btn-secondary" onClick={toggleTheme} style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user ? (
                    <Link to="/profile" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <User size={18} /> Профиль
                    </Link>
                ) : (
                    <button className="btn-primary" onClick={() => setIsAuthOpen(true)}>
                        <LogIn size={18} /> Войти
                    </button>
                )}
            </nav>
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </header>
    );
};

export default Header;
