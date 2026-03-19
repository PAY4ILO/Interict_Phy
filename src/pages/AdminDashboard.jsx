import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Eye, EyeOff } from 'lucide-react';
import { useTopics } from '../hooks/useTopics';
import { topicService } from '../api/topicService';
import { useToast } from '../contexts/ToastContext';

const AdminDashboard = () => {
    const { topics, loading } = useTopics(true);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const createNewTopic = async () => {
        try {
            const data = await topicService.createTopic({ action: 'create', title: 'Новая Тема' });
            if (data.success) {
                navigate(`/admin/topic/${data.id}`);
            }
        } catch (err) {
            console.error(err);
            showToast('Ошибка создания темы', 'error');
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Панель Управления</h1>
                <button className="btn-primary" onClick={createNewTopic}>
                    <PlusCircle size={20} /> Создать Тему
                </button>
            </div>

            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Название темы</th>
                            <th style={{ padding: '1rem' }}>Статус</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t.id}</td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{t.title}</td>
                                <td style={{ padding: '1rem' }}>
                                    {t.is_published == 1 ? (
                                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={16} /> Опубликовано</span>
                                    ) : (
                                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}><EyeOff size={16} /> Черновик</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <Link to={`/admin/topic/${t.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Edit size={16} /> Редактировать
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {topics.length === 0 && !loading && (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ни одной пользовательской темы не найдено.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
