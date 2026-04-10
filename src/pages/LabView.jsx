import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, Maximize2, Minimize2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { topicService } from '../api/topicService';
import BallisticsSim from '../components/simulations/BallisticsSim';
import InclineSim from '../components/simulations/InclineSim';
import CircularSim from '../components/simulations/CircularSim';
import TorqueSim from '../components/simulations/TorqueSim';
import PendulumSim from '../components/simulations/PendulumSim';
import CollisionsSim from '../components/simulations/CollisionsSim';
import GravitySim from '../components/simulations/GravitySim';
import SpringSim from '../components/simulations/SpringSim';
import GasSim from '../components/simulations/GasSim';
import { THEORY_DATA } from '../data/theory';

const LabView = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'sim'
    const [isPresentation, setIsPresentation] = useState(false);
    const [hideResults, setHideResults] = useState(false);
    const [theoryCollapsed, setTheoryCollapsed] = useState(false);
    const presentationRef = useRef(null);

    const [topicData, setTopicData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id.startsWith('db_')) {
            const tId = id.replace('db_', '');

            const fetchTopic = async () => {
                try {
                    const data = await topicService.getAllTopics();
                    if (data.success) {
                        const t = data.topics.find(t => t.id.toString() === tId);
                        setTopicData(t || null);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchTopic();
        } else {
            // It's a built-in topic
            setTopicData({
                title: getTitleForId(id),
                theory_content: THEORY_DATA[id] || `<p>Нет теории для данной встроенной темы.</p>`,
            });
            setLoading(false);
        }
    }, [id]);

    // Handle Esc to exit presentation mode
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isPresentation) {
                exitPresentation();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPresentation]);

    // Listen for fullscreen change (e.g. user presses Esc natively)
    useEffect(() => {
        const handleFsChange = () => {
            if (!document.fullscreenElement) {
                setIsPresentation(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const getTitleForId = (labId) => {
        const map = {
            'ballistics': 'Баллистика',
            'incline': 'Наклонная плоскость',
            'circular': 'Движение по кругу',
            'torque': 'Момент силы',
            'pendulum': 'Маятник',
            'collisions': 'Упругий удар',
            'gravity': 'Гравитация',
            'spring': 'Закон Гука',
            'gas': 'Идеальный газ'
        };
        return map[labId] || 'Лабораторная Работа';
    };

    const enterPresentation = () => {
        setIsPresentation(true);
        setActiveTab('sim');
        if (presentationRef.current?.requestFullscreen) {
            presentationRef.current.requestFullscreen().catch(() => {});
        }
    };

    const exitPresentation = () => {
        setIsPresentation(false);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    };

    const renderSimulation = () => {
        const props = { hideResults };
        switch (id) {
            case 'ballistics': return <BallisticsSim {...props} />;
            case 'incline': return <InclineSim {...props} />;
            case 'circular': return <CircularSim {...props} />;
            case 'torque': return <TorqueSim {...props} />;
            case 'pendulum': return <PendulumSim {...props} />;
            case 'collisions': return <CollisionsSim {...props} />;
            case 'gravity': return <GravitySim {...props} />;
            case 'spring': return <SpringSim {...props} />;
            case 'gas': return <GasSim {...props} />;
            default:
                return (
                    <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px', color: 'var(--text-muted)' }}>
                        <h2>Для данной пользовательской темы нет интерактивной симуляции.</h2>
                        <p>Используйте вкладку &quot;Теория&quot; для изучения материала.</p>
                    </div>
                );
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;
    if (!topicData) return <div style={{ padding: '2rem', textAlign: 'center' }}>Тема не найдена</div>;

    // ── Presentation Mode ──
    if (isPresentation) {
        return (
            <div
                ref={presentationRef}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'var(--bg-body)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem',
                }}
            >
                {/* Top bar in presentation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                        🎓 {topicData.title} — Режим презентации
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={() => setHideResults(!hideResults)}
                            className="btn-secondary"
                            style={{ padding: '10px 18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                            title={hideResults ? 'Показать результаты' : 'Скрыть результаты'}
                        >
                            {hideResults ? <EyeOff size={20} /> : <Eye size={20} />}
                            {hideResults ? 'Показать' : 'Скрыть'}
                        </button>
                        <button
                            onClick={exitPresentation}
                            className="btn-secondary"
                            style={{ padding: '10px 18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                        >
                            <Minimize2 size={20} /> Выйти (Esc)
                        </button>
                    </div>
                </div>

                {/* Simulation fills rest of screen */}
                <div style={{ flex: 1, minHeight: 0 }}>
                    {renderSimulation()}
                </div>
            </div>
        );
    }

    // ── Normal Mode ──
    return (
        <div ref={presentationRef} className="animate-fade-in" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <Link to="/" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <ArrowLeft size={18} /> Назад
                </Link>
                <h1 style={{ margin: 0 }}>{topicData.title}</h1>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button
                    className={activeTab === 'theory' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('theory')}
                    style={{ width: '150px' }}
                >
                    <FileText size={18} /> Теория
                </button>
                <button
                    className={activeTab === 'sim' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('sim')}
                    style={{ width: '150px' }}
                >
                    <PlayCircle size={18} /> Симуляция
                </button>

                {/* Separator */}
                <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />

                {/* Presentation Mode Button */}
                <button
                    onClick={enterPresentation}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
                    title="Режим презентации — на весь экран"
                >
                    <Maximize2 size={18} /> Презентация
                </button>

                {/* Hide Results Toggle */}
                {activeTab === 'sim' && (
                    <button
                        onClick={() => setHideResults(!hideResults)}
                        className="btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            color: hideResults ? '#f59e0b' : 'var(--text-main)',
                            borderColor: hideResults ? 'rgba(245,158,11,0.4)' : 'var(--border)',
                            background: hideResults ? 'rgba(245,158,11,0.1)' : 'transparent',
                        }}
                        title={hideResults ? 'Показать результаты' : 'Скрыть результаты — режим вопроса'}
                    >
                        {hideResults ? <EyeOff size={18} /> : <Eye size={18} />}
                        {hideResults ? 'Результаты скрыты' : 'Скрыть результаты'}
                    </button>
                )}
            </div>

            <div style={{ flex: 1 }}>
                {activeTab === 'theory' ? (
                    <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        {/* Collapsible Theory Header */}
                        <button
                            onClick={() => setTheoryCollapsed(!theoryCollapsed)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem 2rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: theoryCollapsed ? 'none' : '1px solid var(--border)',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '1.2rem',
                                fontWeight: 600,
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={20} color="var(--primary)" />
                                Теоретический материал
                            </span>
                            {theoryCollapsed ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                        </button>

                        {/* Collapsible Theory Content */}
                        <div style={{
                            maxHeight: theoryCollapsed ? '0px' : '2000px',
                            overflow: 'hidden',
                            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
                            padding: theoryCollapsed ? '0 2rem' : '2rem',
                        }}>
                            <div dangerouslySetInnerHTML={{ __html: topicData.theory_content || '<p>Нет теории для данной темы.</p>' }} className="rich-content" />
                        </div>
                    </div>
                ) : (
                    renderSimulation()
                )}
            </div>

        </div>
    );
};

export default LabView;
