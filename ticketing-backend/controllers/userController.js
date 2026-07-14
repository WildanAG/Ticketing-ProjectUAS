const db = require('../models');
const { nanoid } = require('nanoid');
const transporter = require('../config/mailer');

// ─── GET ALL USERS (role: user) ──────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await db.User.findAll({
            where: { role: 'user' },
            attributes: ['user_id', 'username', 'email', 'join_date', 'status', 'number', 'socialmedia', 'cv', 'role'],
            order: [['user_id', 'ASC']]
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Gagal mengambil data users.' });
    }
};

// ─── GET ALL ORGANIZERS (role: eo) ───────────────────────────────────────────
const getAllOrganizers = async (req, res) => {
    try {
        const users = await db.User.findAll({
            where: { role: 'eo', status: 'active' },
            attributes: ['user_id', 'username', 'email', 'join_date', 'status', 'number', 'socialmedia', 'cv', 'role'],
            order: [['user_id', 'ASC']]
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching organizers:', error);
        return res.status(500).json({ message: 'Gagal mengambil data organizer.' });
    }
};

// ─── GET PENDING ORGANIZERS ───────────────────────────────────────────────────
const getPendingOrganizers = async (req, res) => {
    try {
        const pending = await db.User.findAll({
            where: { role: 'eo', status: 'pending' },
            attributes: ['user_id', 'username', 'email', 'number', 'socialmedia', 'cv', 'join_date'],
            order: [['join_date', 'DESC']]
        });
        return res.status(200).json(pending);
    } catch (error) {
        console.error('Error fetching pending:', error);
        return res.status(500).json({ message: 'Gagal mengambil data pending organizer.' });
    }
};

// ─── APPROVE ORGANIZER → kirim email ─────────────────────────────────────────
const approveOrganizer = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await db.User.findOne({ where: { user_id: id, role: 'eo', status: 'pending' } });
        if (!user) {
            return res.status(404).json({ message: 'Organizer pending tidak ditemukan.' });
        }

        // Generate password baru saat approve
        const generatedPassword = nanoid(10);
        user.password = generatedPassword;
        user.status = 'active';
        await user.save();

        // Kirim email berisi password setelah admin approve
        await transporter.sendMail({
            from: `"TickeTing App" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Selamat! Akun Organizer Anda Telah Disetujui',
            html: `
                <h2>Pendaftaran Disetujui ✅</h2>
                <p>Halo <b>${user.username}</b>,</p>
                <p>Akun event organizer kamu telah disetujui oleh admin TickeTing.</p>
                <br/>
                <p><b>Username:</b> ${user.username}</p>
                <p><b>Email:</b> ${user.email}</p>
                <p><b>Password:</b> ${generatedPassword}</p>
                <br/>
                <p>Silakan login dan segera ganti password kamu.</p>
                <p>Terima kasih telah bergabung bersama TickeTing!</p>
            `
        });

        return res.status(200).json({ message: 'Organizer berhasil disetujui dan email telah dikirim.' });
    } catch (error) {
        console.error('Error approving organizer:', error);
        return res.status(500).json({ message: 'Gagal menyetujui organizer.' });
    }
};

// ─── REJECT ORGANIZER ────────────────────────────────────────────────────────
const rejectOrganizer = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await db.User.findOne({ where: { user_id: id, role: 'eo', status: 'pending' } });
        if (!user) {
            return res.status(404).json({ message: 'Organizer pending tidak ditemukan.' });
        }

        await user.destroy();

        return res.status(200).json({ message: 'Organizer berhasil ditolak dan dihapus.' });
    } catch (error) {
        console.error('Error rejecting organizer:', error);
        return res.status(500).json({ message: 'Gagal menolak organizer.' });
    }
};

// ─── UPDATE STATUS (active / suspend / banned) ───────────────────────────────
const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ['active', 'suspend', 'banned'];
    if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({
            message: `Status tidak valid. Gunakan salah satu dari: ${allowedStatus.join(', ')}.`
        });
    }

    try {
        const user = await db.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan atau sudah dihapus.' });
        }

        user.status = status;
        await user.save();

        return res.status(200).json({ message: `User berhasil di-${status}.`, data: user });
    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ message: 'Gagal mengubah status user.' });
    }
};

// ─── REGISTER ORGANIZER (tanpa kirim email) ───────────────────────────────────
const registerOrganizer = async (req, res) => {
    try {
        const { username, email, number, socialmedia } = req.body;

        if (!username || !email || !number) {
            return res.status(400).json({ message: 'Username, email, dan number wajib diisi.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'CV wajib diunggah.' });
        }

        const existing = await db.User.findOne({
            where: { [db.Sequelize.Op.or]: [{ username }, { email }] }
        });
        if (existing) {
            return res.status(409).json({ message: 'Username atau email sudah terdaftar.' });
        }

        const cvPath = `/uploads/cv/${req.file.filename}`;

        // Ambil user_id terbesar lalu +1 agar tidak tabrakan
        const lastUser = await db.User.findOne({ order: [['user_id', 'DESC']] });
        const nextId = lastUser ? lastUser.user_id + 1 : 1;

        const organizer = await db.User.create({
            user_id: nextId,
            username,
            password: '-',
            email,
            join_date: new Date(),
            status: 'pending',
            number: parseInt(number, 10),
            socialmedia: socialmedia || '',
            cv: cvPath,
            role: 'eo'
        });

        const { password: _pw, ...safeData } = organizer.toJSON();
        return res.status(201).json({
            message: 'Pendaftaran berhasil dikirim. Tunggu persetujuan admin.',
            data: safeData
        });
    } catch (error) {
        console.error('Error registering organizer:', error);
        return res.status(500).json({ message: 'Gagal mendaftarkan event organizer.' });
    }
};

// ─── REGISTER USER (password manual dari input) ──────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, dan password wajib diisi.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password minimal 6 karakter.' });
        }

        const existing = await db.User.findOne({
            where: { [db.Sequelize.Op.or]: [{ username }, { email }] }
        });
        if (existing) {
            return res.status(409).json({ message: 'Username atau email sudah terdaftar.' });
        }

        // Ambil user_id terbesar lalu +1 agar tidak tabrakan
        const lastUser = await db.User.findOne({ order: [['user_id', 'DESC']] });
        const nextId = lastUser ? lastUser.user_id + 1 : 1;

        const newUser = await db.User.create({
            user_id: nextId,
            username,
            password,
            email,
            join_date: new Date(),
            status: 'active',
            // number: number ? parseInt(number, 10) : null,
            // socialmedia: socialmedia || '',
            role: 'user'
        });

        const { password: _pw, ...safeData } = newUser.toJSON();
        return res.status(201).json({
            message: 'Registrasi berhasil.',
            data: safeData
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Gagal mendaftarkan user.' });
    }
};

// ─── EDIT USER (username, email, number - opsional) ──────────────────────────
const editUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, number } = req.body;

    if (username === undefined && email === undefined && number === undefined) {
        return res.status(400).json({ message: 'Minimal satu field (username, email, number) harus diisi.' });
    }

    try {
        const user = await db.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        // Cek duplikat username/email milik user lain
        if (username || email) {
            const existing = await db.User.findOne({
                where: {
                    user_id: { [db.Sequelize.Op.ne]: id },
                    [db.Sequelize.Op.or]: [
                        ...(username ? [{ username }] : []),
                        ...(email ? [{ email }] : [])
                    ]
                }
            });
            if (existing) {
                return res.status(409).json({ message: 'Username atau email sudah digunakan oleh user lain.' });
            }
        }

        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;

        // number opsional: hanya di-update kalau dikirim dan valid, biarkan null kalau tidak diisi
        if (number !== undefined && number !== null && number !== '') {
            user.number = parseInt(number, 10);
        }

        await user.save();

        const { password: _pw, ...safeData } = user.toJSON();
        return res.status(200).json({ message: 'Data user berhasil diperbarui.', data: safeData });
    } catch (error) {
        console.error('Error editing user:', error);
        return res.status(500).json({ message: 'Gagal memperbarui data user.' });
    }
};

module.exports = {
    getAllUsers,
    getAllOrganizers,
    getPendingOrganizers,
    approveOrganizer,
    rejectOrganizer,
    updateStatus,
    registerOrganizer,
    registerUser,
    editUser
};