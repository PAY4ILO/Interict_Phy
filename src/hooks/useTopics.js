import { useState, useEffect, useCallback } from 'react';
import { topicService } from '../api/topicService';

export const useTopics = (admin = false) => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTopics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await topicService.getAllTopics(admin);
            if (data.success) {
                setTopics(data.topics || []);
            } else {
                setError(data.error || data.message || 'Ошибка загрузки тем');
            }
        } catch (err) {
            console.error('Error fetching topics:', err);
            setError(err.message || 'Ошибка сети при загрузке тем');
        } finally {
            setLoading(false);
        }
    }, [admin]);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    return { topics, loading, error, refetch: fetchTopics };
};
