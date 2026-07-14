const db = require('../models');
const jwt = require('jsonwebtoken');

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier = username atau email

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Username/email dan password wajib diisi.' });
        }

        const user = await db.User.findOne({
            where: {
                [db.Sequelize.Op.or]: [{ username: identifier }, { email: identifier }]
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Username/email atau password salah.' });
        }

        // Hanya admin & eo yang boleh login lewat sini
        if (!['admin', 'eo', 'user'].includes(user.role)) {
            return res.status(403).json({ message: 'Akun ini tidak memiliki akses untuk login di sini.' });
        }
        
        // NOTE: password masih plaintext, konsisten dengan registerOrganizer/approveOrganizer
        if (user.password !== password) {
            return res.status(401).json({ message: 'Username/email atau password salah.' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Akun kamu masih menunggu persetujuan admin.' });
        }
        if (user.status === 'suspend') {
            return res.status(403).json({ message: 'Akun kamu sedang di-suspend.' });
        }
        if (user.status === 'banned') {
            return res.status(403).json({ message: 'Akun kamu telah dibanned.' });
        }

        const payload = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 hari
        });

        return res.status(200).json({
            message: 'Login berhasil.',
            data: payload
        });
    } catch (error) {
        console.error('Error login:', error);
        return res.status(500).json({ message: 'Gagal melakukan login.' });
    }
};

// ─── ME (cek sesi aktif) ────────────────────────────────────────────────────────
const me = async (req, res) => {
    return res.status(200).json({ data: req.user });
};

// ─── LOGOUT ────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logout berhasil.' });
};

module.exports = { login, me, logout };