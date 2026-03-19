const USERS_KEY = 'physics_lab_users';

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

export const authService = {
    login: async (email, password) => {
        // Принудительный админский логин для тестирования
        if (email === 'admin@mail.ru' || (email === 'kiduakov321@gmail.com')) {
            return { success: true, user: { email, name: 'Администратор', role: 'admin', plan: 'advanced' } };
        }

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // eslint-disable-next-line no-unused-vars
            const { password: _p, ...safeUser } = user;
            return { success: true, user: safeUser };
        }
        return { success: false, message: 'Неверный email или пароль' };
    },
    
    register: async (email, password, name) => {
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Пользователь уже существует' };
        }
        users.push({ email, password, name, role: 'user', plan: 'free' });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return { success: true };
    }
};
