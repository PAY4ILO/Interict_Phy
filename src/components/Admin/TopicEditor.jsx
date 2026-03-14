import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'code-block'],
        ['clean']
    ],
};

const TopicEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [theoryContent, setTheoryContent] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);

    // Prevent unauthorized access conceptually
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (id) {
            const fetchTopic = async () => {
                try {
                    const res = await axios.get('/api/topics.php?admin=true');
                    if (res.data.success) {
                        const topic = res.data.topics.find(t => t.id.toString() === id);
                        if (topic) {
                            setTitle(topic.title || '');
                            setDescription(topic.description || '');
                            setTheoryContent(topic.theory_content || '');
                            setIsPublished(topic.is_published == 1);
                            setImageUrl(topic.image_url || '');
                        }
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchTopic();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleSave = async () => {
        try {
            const payload = {
                action: 'update',
                id,
                title,
                description,
                theory_content: theoryContent,
                image_url: imageUrl,
                is_published: isPublished
            };
            const res = await axios.post('/api/topics.php', payload);
            if (res.data.success) {
                alert('Тема успешно сохранена!');
                navigate('/admin');
            }
        } catch (err) {
            alert('Ошибка при сохранении');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post('/api/upload.php', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setImageUrl(res.data.url);
            } else {
                alert(res.data.message || 'Ошибка загрузки');
            }
        } catch (err) {
            alert('Ошибка при загрузке изображения');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="btn-secondary" onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> Назад
                </button>
                <button className="btn-primary" onClick={handleSave}>
                    <Save size={18} /> Сохранить
                </button>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Редактор Темы</h2>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={e => setIsPublished(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                        />
                        {isPublished ? <span style={{ color: '#10b981' }}>Опубликовано</span> : <span style={{ color: '#f59e0b' }}>Черновик</span>}
                    </label>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Название темы</label>
                    <input
                        type="text"
                        className="input-premium"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Например: Ньютоновская механика"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>ОПИСАНИЕ (кратко)</label>
                    <textarea
                        className="input-premium"
                        rows={3}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Коротко о чем эта лабораторная работа..."
                        style={{ resize: 'vertical' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Обложка темы</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="text"
                            className="input-premium"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            placeholder="URL изображения или загрузите файл"
                        />
                        <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <ImageIcon size={18} /> Загрузить
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                        </label>
                    </div>
                    {imageUrl && (
                        <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', height: '150px', width: '250px', border: '1px solid var(--border)' }}>
                            <img src={imageUrl} alt="Превью" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Теория (содержание)</label>
                    <div style={{ background: 'var(--bg-card)', borderRadius: '8px' }}>
                        <ReactQuill
                            theme="snow"
                            modules={modules}
                            value={theoryContent}
                            onChange={setTheoryContent}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicEditor;
