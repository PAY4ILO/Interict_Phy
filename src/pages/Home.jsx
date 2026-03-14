import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STATIC_TOPICS = [
    { id: 'incline', key: 'incline', title: 'Наклонная плоскость', type: 'Динамика', desc: 'Разложение сил, трение и ускорение бруска.', icon: '📐', free: true },
    { id: 'circular', key: 'circular', title: 'Движение по кругу', type: 'Кинематика', desc: 'Ускорение и период.', icon: '🔄', free: true },
    { id: 'torque', key: 'torque', title: 'Момент силы', type: 'Статика', desc: 'Рычаг и баланс.', icon: '⚖️', free: true },
    { id: 'ballistics', key: 'ballistics', title: 'Баллистика', type: 'Механика', desc: 'Движение тела под углом к горизонту.', icon: '🚀', free: false },
    { id: 'pendulum', key: 'pendulum', title: 'Маятник', type: 'Колебания', desc: 'Математический и пружинный маятник.', icon: '⏱️', free: false },
    { id: 'collisions', key: 'collisions', title: 'Упругий удар', type: 'Импульс', desc: 'Закон сохранения импульса и энергии.', icon: '💥', free: false },
    { id: 'gravity', key: 'gravity', title: 'Гравитация', type: 'Астрофизика', desc: 'Закон всемирного тяготения.', icon: '🪐', free: false },
    { id: 'spring', key: 'spring', title: 'Закон Гука', type: 'Динамика', desc: 'Пружины и упругость.', icon: '🌀', free: false },
    { id: 'gas', key: 'gas', title: 'Идеальный газ', type: 'Молекулярная', desc: 'Изопроцессы идеального газа.', icon: '🌡️', free: false },
];

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await axios.get('/api/topics.php');
                if (res.data.success) {
                    setTopics(res.data.topics);
                }
            } catch (err) {
                console.error('Error fetching dynamic topics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Виртуальная Лаборатория
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Интерактивные симуляции физических процессов и теоретические заметки для подготовки к лабораторным работам.
                </p>
            </div>

            <div className="card-grid">
                {STATIC_TOPICS.map(topic => {
                    const isLocked = !topic.free && (!user || (user.role !== 'admin' && user.plan !== 'advanced'));

                    return (
                        <div
                            key={topic.key}
                            className="glass"
                            style={{ textDecoration: 'none', color: 'inherit', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', position: 'relative', cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.8 : 1 }}
                            onClick={() => {
                                if (isLocked) {
                                    alert('Эта тема доступна только по премиум подписке. Пожалуйста, войдите в аккаунт с доступом.');
                                } else {
                                    navigate(`/lab/${topic.key}`);
                                }
                            }}
                        >
                            {isLocked && (
                                <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)', zIndex: 10 }}>
                                    <Lock size={14} color="#f59e0b" /> В разработке / Premium
                                </div>
                            )}
                            <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', background: `var(--c-${topic.key}-bg)`, color: `var(--c-${topic.key}-text)`, filter: isLocked ? 'grayscale(80%)' : 'none' }}>
                                {topic.icon}
                            </div>
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <span style={{ background: `var(--c-${topic.key}-badge)`, color: `var(--c-${topic.key}-text)`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                    {topic.type}
                                </span>
                                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>{topic.title}</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                                    {topic.desc}
                                </p>
                                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', fontWeight: 600, color: isLocked ? 'var(--text-muted)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isLocked ? 'Доступ закрыт' : 'Начать'} {!isLocked && <BookOpen size={18} />}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {topics.map(topic => (
                    <Link to={`/lab/db_${topic.id}`} key={`db_${topic.id}`} className="glass" style={{ textDecoration: 'none', color: 'inherit', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-header)', overflow: 'hidden' }}>
                            {topic.image_url ? (
                                <img src={topic.image_url} alt={topic.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <AlertCircle size={48} color="var(--primary)" />
                            )}
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                Пользовательская тема
                            </span>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>{topic.title}</h2>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                                {topic.description || "Описание отсутствует..."}
                            </p>
                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Читать теорию <BookOpen size={18} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
