const db = require('../models');
const { Op } = require('sequelize');

const createTicket = async (req, res) => {
    try {
        const {
            event_id,
            ticket_category,
            ticket_quota,
            current_price,
            base_price,
            ticket_sold
        } = req.body;

        if (!event_id || !ticket_category || !ticket_quota || !current_price || !base_price) {
            return res.status(400).json({ success: false, message: 'Field wajib tidak lengkap' });
        }

        const event = await db.Event.findByPk(event_id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
        }

        // ← ownership check
        if (event.user_id !== req.user.user_id) {
            return res.status(403).json({ success: false, message: 'Kamu tidak berhak menambah tiket ke event ini.' });
        }

        // ← cek total kuota tidak melebihi max_capacity event
        const existingTotal = await db.Ticket.sum('ticket_quota', {
            where: { event_id }
        }) || 0;

        const newQuota = parseInt(ticket_quota);

        if (existingTotal + newQuota > event.max_capacity) {
            return res.status(400).json({
                success: false,
                message: `Kuota tiket melebihi kapasitas event. Sisa kuota tersedia: ${event.max_capacity - existingTotal}`
            });
        }

        const newTicket = await db.Ticket.create({
            event_id: parseInt(event_id),
            ticket_category: ticket_category.trim(),
            ticket_quota: parseInt(ticket_quota),
            current_price: parseInt(current_price),
            base_price: parseInt(base_price),
            ticket_sold: ticket_sold ? parseInt(ticket_sold) : 0
        });

        if (event.ticket_start && event.ticket_ends) {
            await event.update({ event_status: 'upcoming' });
        }

        res.status(201).json({ success: true, message: 'Tiket berhasil dibuat', data: newTicket });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getTicketsByEvent = async (req, res) => {
    try {
        const { event_id } = req.params;

        const tickets = await db.Ticket.findAll({
            where: { event_id }
        });

        const result = tickets.map(ticket => ({
            ...ticket.toJSON(),
            remaining_stock: ticket.ticket_quota - ticket.ticket_sold,
            sold_out: ticket.ticket_sold >= ticket.ticket_quota
        }));

        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await db.Ticket.findByPk(id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { ticket_category, ticket_quota, current_price, base_price, ticket_sold } = req.body;

        const ticket = await db.Ticket.findByPk(id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });

        // ← ownership check lewat event induknya
        const event = await db.Event.findByPk(ticket.event_id);
        if (!event || event.user_id !== req.user.user_id) {
            return res.status(403).json({ success: false, message: 'Kamu tidak berhak mengubah tiket ini.' });
        }

        if (ticket_quota) {
            const newQuota = parseInt(ticket_quota);
            // total kuota kategori lain (di luar tiket ini sendiri)
            const otherTotal = await db.Ticket.sum('ticket_quota', {
                where: {
                    event_id: ticket.event_id,
                    ticket_id: { [Op.ne]: ticket.ticket_id }
                }
            }) || 0;

            if (otherTotal + newQuota > event.max_capacity) {
                return res.status(400).json({
                    success: false,
                    message: `Kuota tiket melebihi kapasitas event. Sisa kuota tersedia: ${event.max_capacity - otherTotal}`
                });
            }
            ticket.ticket_quota = newQuota;
        }

        if (ticket_category) ticket.ticket_category = ticket_category;
        if (ticket_quota) ticket.ticket_quota = parseInt(ticket_quota);
        if (current_price) ticket.current_price = parseInt(current_price);
        if (base_price) ticket.base_price = parseInt(base_price);
        if (ticket_sold !== undefined) ticket.ticket_sold = parseInt(ticket_sold);

        await ticket.save();
        res.json({ success: true, message: 'Tiket berhasil diupdate', data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await db.Ticket.findByPk(id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });

        // ← ownership check
        const event = await db.Event.findByPk(ticket.event_id);
        if (!event || event.user_id !== req.user.user_id) {
            return res.status(403).json({ success: false, message: 'Kamu tidak berhak menghapus tiket ini.' });
        }

        const event_id = ticket.event_id;
        await ticket.destroy();

        const remainingTickets = await db.Ticket.count({ where: { event_id } });
        if (remainingTickets === 0) {
            await db.Event.update({ event_status: 'private' }, { where: { event_id } });
        }

        res.json({ success: true, message: 'Tiket berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createTicket, getTicketsByEvent, getTicketById, updateTicket, deleteTicket };