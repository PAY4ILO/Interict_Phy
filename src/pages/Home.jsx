import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Lock, Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTopics } from '../hooks/useTopics';
import { useToast } from '../contexts/ToastContext';

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

const SECTION_FILTERS = ['Все', 'Кинематика', 'Динамика', 'Статика', 'Механика', 'Колебания', 'Импульс', 'Астрофизика', 'Молекулярная'];
const ACCESS_FILTERS = [
    { label: 'Все', value: 'all' },
    { label: '🔓 Бесплатные', value: 'free' },
    { label: '👑 Премиум', value: 'premium' },
];

// Component that reveals its children when scrolled into viewport
const RevealCard = ({ children, delay = 0, style, className, ...props }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${className || ''} reveal-card ${isVisible ? 'reveal-visible' : ''}`}
            style={{ ...style, transitionDelay: `${delay}ms` }}
            {...props}
        >
            {children}
        </div>
    );
};

const Home = () => {
    const { user } = useAuth();
    const { topics, loading, error } = useTopics();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('Все');
    const [activeAccess, setActiveAccess] = useState('all');

    const filteredTopics = useMemo(() => {
        return STATIC_TOPICS.filter(topic => {
            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesSearch = topic.title.toLowerCase().includes(q) ||
                    topic.desc.toLowerCase().includes(q) ||
                    topic.type.toLowerCase().includes(q);
                if (!matchesSearch) return false;
            }
            // Section filter
            if (activeSection !== 'Все' && topic.type !== activeSection) return false;
            // Access filter
            if (activeAccess === 'free' && !topic.free) return false;
            if (activeAccess === 'premium' && topic.free) return false;
            return true;
        });
    }, [searchQuery, activeSection, activeAccess]);

    const activeFilterCount = (activeSection !== 'Все' ? 1 : 0) + (activeAccess !== 'all' ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

    // Unique key that changes whenever filters change, forcing React to re-mount cards with animation
    const filterKey = `${activeSection}_${activeAccess}_${searchQuery.trim()}`;

    const clearAllFilters = () => {
        setSearchQuery('');
        setActiveSection('Все');
        setActiveAccess('all');
    };

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

            {/* ── Filter Bar ── */}
            <div className="glass filter-bar" style={{
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
            }}>
                {/* Row 1: Search + Counter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{
                        position: 'relative',
                        flex: '1 1 280px',
                        maxWidth: '420px',
                    }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                            pointerEvents: 'none',
                        }} />
                        <input
                            type="text"
                            placeholder="Поиск по названию или описанию..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-premium"
                            style={{
                                paddingLeft: '42px',
                                paddingRight: searchQuery ? '38px' : '16px',
                                height: '44px',
                                fontSize: '0.9rem',
                                borderRadius: '12px',
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                <X size={14} /> Сбросить ({activeFilterCount})
                            </button>
                        )}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                        }}>
                            <SlidersHorizontal size={16} />
                            <span>Найдено: <strong style={{ color: 'var(--text-main)' }}>{filteredTopics.length}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Row 2: Section chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Раздел физики
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {SECTION_FILTERS.map(section => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className="filter-chip"
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: '10px',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: activeSection === section ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    background: activeSection === section ? 'var(--primary)' : 'transparent',
                                    color: activeSection === section ? '#fff' : 'var(--text-muted)',
                                    boxShadow: activeSection === section ? '0 4px 12px var(--primary-glow)' : 'none',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                {section}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Row 3: Access filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Доступ
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {ACCESS_FILTERS.map(af => (
                            <button
                                key={af.value}
                                onClick={() => setActiveAccess(af.value)}
                                className="filter-chip"
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: '10px',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: activeAccess === af.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    background: activeAccess === af.value ? 'var(--primary)' : 'transparent',
                                    color: activeAccess === af.value ? '#fff' : 'var(--text-muted)',
                                    boxShadow: activeAccess === af.value ? '0 4px 12px var(--primary-glow)' : 'none',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                {af.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Topic Cards ── */}
            <div className="card-grid" key={filterKey}>
                {filteredTopics.map((topic, index) => {
                    const isLocked = !topic.free && (!user || (user.role !== 'admin' && user.plan !== 'advanced'));

                    return (
                        <RevealCard
                            key={topic.key}
                            delay={index * 80}
                            className="glass"
                            style={{ textDecoration: 'none', color: 'inherit', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', cursor: isLocked ? 'not-allowed' : 'pointer' }}
                            onClick={() => {
                                if (isLocked) {
                                    showToast('Эта тема доступна только по премиум подписке!', 'error');
                                } else {
                                    navigate(`/lab/${topic.key}`);
                                }
                            }}
                        >
                            {isLocked && (
                                <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--bg-card)', padding: '6px 10px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)', zIndex: 10 }}>
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
                        </RevealCard>
                    );
                })}

                {topics.map((topic, index) => (
                    <RevealCard key={`db_${topic.id}`} delay={(filteredTopics.length + index) * 80} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/lab/db_${topic.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
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
                    </RevealCard>
                ))}
            </div>

            {/* Empty state */}
            {filteredTopics.length === 0 && !loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: 'var(--text-muted)',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>Ничего не найдено</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>Попробуйте изменить фильтры или поисковый запрос</p>
                    <button onClick={clearAllFilters} className="btn-secondary" style={{ fontSize: '0.9rem' }}>
                        Сбросить все фильтры
                    </button>
                </div>
            )}

            {error && <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '2rem' }}>{error}</div>}
            {loading && <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>Загрузка тем...</div>}
        </div>
    );
};

export default Home;
