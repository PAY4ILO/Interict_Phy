import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, PlayCircle, FileText } from 'lucide-react';
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

    const [topicId, setTopicId] = useState(null);
    const [topicData, setTopicData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id.startsWith('db_')) {
            const tId = id.replace('db_', '');
            setTopicId(tId);

            const fetchTopic = async () => {
                try {
                    const res = await axios.get('/api/topics.php');
                    if (res.data.success) {
                        const t = res.data.topics.find(t => t.id.toString() === tId);
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

    const renderSimulation = () => {
        switch (id) {
            case 'ballistics': return <BallisticsSim />;
            case 'incline': return <InclineSim />;
            case 'circular': return <CircularSim />;
            case 'torque': return <TorqueSim />;
            case 'pendulum': return <PendulumSim />;
            case 'collisions': return <CollisionsSim />;
            case 'gravity': return <GravitySim />;
            case 'spring': return <SpringSim />;
            case 'gas': return <GasSim />;
            default:
                return (
                    <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px', color: 'var(--text-muted)' }}>
                        <h2>Для данной пользовательской темы нет интерактивной симуляции.</h2>
                        <p>Используйте вкладку "Теория" для изучения материала.</p>
                    </div>
                );
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;
    if (!topicData) return <div style={{ padding: '2rem', textAlign: 'center' }}>Тема не найдена</div>;

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2rem' }}>
                <Link to="/" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <ArrowLeft size={18} /> Назад
                </Link>
                <h1 style={{ margin: 0 }}>{topicData.title}</h1>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
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
            </div>

            <div style={{ flex: 1 }}>
                {activeTab === 'theory' ? (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', minHeight: '500px' }}>
                        <div dangerouslySetInnerHTML={{ __html: topicData.theory_content || '<p>Нет теории для данной темы.</p>' }} className="rich-content" />
                    </div>
                ) : (
                    renderSimulation()
                )}
            </div>

        </div>
    );
};

export default LabView;
