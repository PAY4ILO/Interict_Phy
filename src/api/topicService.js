const DB_KEY = 'physics_lab_topics';

const getTopicsFromStorage = () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
};

const saveTopicsToStorage = (topics) => {
    localStorage.setItem(DB_KEY, JSON.stringify(topics));
};

export const topicService = {
    getAllTopics: async (admin = false) => {
        const topics = getTopicsFromStorage();
        if (admin) return { success: true, topics };
        return { success: true, topics: topics.filter(t => t.is_published) };
    },
    
    getTopic: async (id) => {
        const topics = getTopicsFromStorage();
        const topic = topics.find(t => t.id.toString() === id.toString());
        return { success: !!topic, topic };
    },
    
    createTopic: async (data) => {
        const topics = getTopicsFromStorage();
        const newTopic = {
            id: Date.now(),
            title: data.title || 'Новая Тема',
            description: '',
            theory_content: '',
            image_url: '',
            is_published: false
        };
        topics.push(newTopic);
        saveTopicsToStorage(topics);
        return { success: true, id: newTopic.id };
    },
    
    updateTopic: async (payload) => {
        const topics = getTopicsFromStorage();
        const index = topics.findIndex(t => t.id.toString() === payload.id.toString());
        if (index > -1) {
            topics[index] = { ...topics[index], ...payload };
            saveTopicsToStorage(topics);
            return { success: true };
        }
        return { success: false, message: 'Тема не найдена' };
    },
    
    uploadImage: async (formData) => {
        // Мы преобразуем изображение в Base64 и сохраняем его локально
        return new Promise((resolve) => {
            const file = formData.get('image');
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({ success: true, url: reader.result }); // Base64 DATA URI
                };
                reader.readAsDataURL(file);
            } else {
                resolve({ success: false, message: 'Файл не найден' });
            }
        });
    }
};
