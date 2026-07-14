const db = require('../models');
const path = require('path');
const fs = require('fs');
const { estimateCrowd } = require('../services/pricingService');

const computeStatus = (ticket_start, ticket_ends) => {
    if (!ticket_start || !ticket_ends) return 'private';
    const now = new Date();
    const start = new Date(ticket_start);
    const end = new Date(ticket_ends);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'done';
};

const createEvent = async (req, res) => {
    try {
        const { event_title, event_date, event_location, event_description, ticket_start, ticket_ends, max_capacity } = req.body;

        if (!event_title || !event_date || !event_location || !max_capacity) {
            return res.status(400).json({ message: 'event_title, event_date, event_location, dan max_capacity wajib diisi.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Gambar event wajib diunggah.' });
        }

        const event_status = computeStatus(ticket_start, ticket_ends);

        const newEvent = await db.Event.create({
            event_title: event_title.trim(),
            event_date: new Date(event_date),
            event_location: event_location.trim(),
            description: event_description ? event_description.trim() : null,
            user_id: req.user.user_id, // ← diambil dari JWT, bukan hardcoded lagi
            ticket_start: ticket_start ? new Date(ticket_start) : null,
            ticket_ends: ticket_ends ? new Date(ticket_ends) : null,
            max_capacity: parseInt(max_capacity),
            event_status,
            image: req.file.filename
        });

        return res.status(201).json({
            success: true,
            message: 'Event berhasil dibuat.',
            event_id: newEvent.event_id,
            image: newEvent.image,
            data: newEvent
        });
    } catch (err) {
        if (req.file) fs.unlink(req.file.path, () => {});
        console.error('Error creating event:', err);
        return res.status(500).json({ message: 'Gagal membuat event.', error: err.message });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await db.Event.findAll({
            include: [
                {
                    model: db.User,
                    as: 'organizer', // ← sesuaikan alias sesuai association Event.belongsTo(User, { as: 'organizer', foreignKey: 'user_id' })
                    attributes: ['user_id', 'username', 'email']
                }
            ],
            order: [['event_id', 'DESC']]
        });
        const result = events.map((e) => {
            const plain = e.toJSON();
            plain.event_status = computeStatus(plain.ticket_start, plain.ticket_ends);
            return plain;
        });
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        return res.status(500).json({ message: 'Gagal mengambil data event.', error: err.message });
    }
};

// ─── BARU: event milik EO yang sedang login ──────────────────────────────
const getMyEvents = async (req, res) => {
    try {
        const events = await db.Event.findAll({
            where: { user_id: req.user.user_id },
            order: [['event_id', 'DESC']]
        });
        const result = events.map((e) => {
            const plain = e.toJSON();
            plain.event_status = computeStatus(plain.ticket_start, plain.ticket_ends);
            return plain;
        });
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        return res.status(500).json({ message: 'Gagal mengambil event kamu.', error: err.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await db.Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event tidak ditemukan.' });

        const plain = event.toJSON();
        plain.event_status = computeStatus(plain.ticket_start, plain.ticket_ends);

        return res.status(200).json({ success: true, data: plain });
    } catch (err) {
        return res.status(500).json({ message: 'Gagal mengambil event.', error: err.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await db.Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event tidak ditemukan.' });

        // ← ownership check: EO cuma boleh edit event miliknya sendiri
        if (event.user_id !== req.user.user_id) {
            return res.status(403).json({ message: 'Kamu tidak berhak mengubah event ini.' });
        }

        const fields = ['event_title', 'event_date', 'event_location', 'ticket_start', 'ticket_ends', 'max_capacity'];
        fields.forEach((f) => { if (req.body[f] !== undefined) event[f] = req.body[f]; });

        if (req.file) {
            fs.unlink(path.join(__dirname, '..', 'uploads', 'events', event.image), () => {});
            event.image = req.file.filename;
        }

        event.event_status = computeStatus(event.ticket_start, event.ticket_ends);
        await event.save();

        return res.status(200).json({ success: true, message: 'Event berhasil diupdate.', data: event });
    } catch (err) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(500).json({ message: 'Gagal update event.', error: err.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await db.Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event tidak ditemukan.' });

        // ← ownership check juga di delete
        if (event.user_id !== req.user.user_id) {
            return res.status(403).json({ message: 'Kamu tidak berhak menghapus event ini.' });
        }

        fs.unlink(path.join(__dirname, '..', 'uploads', 'events', event.image), () => {});
        await event.destroy();

        return res.status(200).json({ success: true, message: 'Event berhasil dihapus.' });
    } catch (err) {
        return res.status(500).json({ message: 'Gagal hapus event.', error: err.message });
    }
};

// ─── BARU: estimasi crowd/kehadiran untuk sebuah event ───────────────────
const getCrowdEstimation = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await estimateCrowd(db, id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Event tidak ditemukan atau gagal menghitung estimasi.'
            });
        }

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('Error getting crowd estimation:', err);
        return res.status(500).json({ message: 'Gagal menghitung estimasi crowd.', error: err.message });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getCrowdEstimation
};