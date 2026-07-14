const jwt = require('jsonwebtoken');

// ─── VERIFY TOKEN ─────────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'Tidak ada token, silakan login terlebih dahulu.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { user_id, username, role }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
};

// ─── AUTHORIZE ROLES ───────────────────────────────────────────────────────────
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Kamu tidak memiliki akses ke resource ini.' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };