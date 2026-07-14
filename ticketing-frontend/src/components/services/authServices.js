const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const login = async (identifier, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // wajib supaya cookie httpOnly ke-set
        body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Login gagal.');
    }
    return data; // { message, data: { user_id, username, email, role } }
};

export const logout = async () => {
    const res = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    return res.json();
};

export const getMe = async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
};