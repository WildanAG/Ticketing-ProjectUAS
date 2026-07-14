const { Op } = require("sequelize");
const db = require("../models");
const { recalculateTicketPrice } = require("../services/pricingService");
const Transaction = db.Transaction;
const Ticket = db.Ticket;
const User = db.User;

const MAX_TICKET_PER_EVENT = 4;

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [
                {
                    model: User,
                    as: 'user', // Pastikan alias ini sesuai dengan yang didefinisikan di db.Transaction.belongsTo(db.User)
                    attributes: ['username']
                },
                {
                    model: Ticket,
                    as: 'ticket', // Pastikan alias ini sesuai dengan db.Transaction.belongsTo(db.Ticket)
                    include: [
                        {
                            model: db.Event,
                            as: 'event', // Pastikan alias ini sesuai dengan db.Ticket.belongsTo(db.Event)
                            attributes: ['event_title']
                        }
                    ]
                }
            ],
            order: [['order_date', 'DESC']]
        });

        // Melakukan mapping data mentah dari DB agar strukturnya bersih sesuai kolom tabel
        const result = transactions.map(trx => ({
            transaction_id: trx.transaction_id,
            username: trx.user ? trx.user.username : "N/A",
            amount: trx.total_prices,
            event: (trx.ticket && trx.ticket.event) ? trx.ticket.event.event_title : "N/A",
            date: trx.order_date,
            status: trx.transaction_status
        }));

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Mengambil semua transaksi berdasarkan user_id (tanpa perlu token/middleware)
exports.getAllTransactionsByUser = async (req, res) => {
    try {
        const { user_id } = req.query; // Ambil user_id dari query string (?user_id=xxx)

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "user_id tidak boleh kosong"
            });
        }

        const transactions = await Transaction.findAll({
            where: { user_id },
            include: [
                {
                    model: Ticket,
                    as: 'ticket',
                    include: [
                        {
                            model: db.Event,
                            as: 'event'
                        }
                    ]
                }
            ],
            order: [['order_date', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: transactions
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.createTransaction = async (req, res) => {
    const t = await db.sequelize.transaction();

    try {

        const { user_id, ticket_id, quantity, method } = req.body;

        // Validasi
        if (!user_id || !ticket_id || !quantity || !method) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Data belum lengkap"
            });
        }

        // Cari user
        const user = await User.findByPk(user_id, {
            transaction: t
        });

        if (!user) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        // Lock tiket
        const ticket = await Ticket.findByPk(ticket_id, {
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!ticket) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Tiket tidak ditemukan"
            });
        }

        // Cek stok
        const sisa = ticket.ticket_quota - ticket.ticket_sold;

        // Tiket sudah habis
        if (sisa <= 0) {
            await t.rollback();

            return res.status(400).json({
                success: false,
                message: "Tiket sudah habis (Sold Out)"
            });
        }

        // Jumlah yang dibeli melebihi stok
        if (quantity > sisa) {
            await t.rollback();

            return res.status(400).json({
                success: false,
                message: `Sisa tiket hanya ${sisa}`
            });
        }

        // Batas pembelian (dinonaktifkan sementara untuk testing dynamic pricing)
        if (user.role === "user") {

            const tickets = await Ticket.findAll({
                where: {
                    event_id: ticket.event_id
                },
                attributes: ["ticket_id"],
                transaction: t
            });

            const ids = tickets.map(item => item.ticket_id);

            const totalBought = await Transaction.sum("quantity", {
                where: {
                    user_id,
                    ticket_id: {
                        [Op.in]: ids
                    },
                    transaction_status: "success"
                },
                transaction: t
            }) || 0;

            if (totalBought + quantity > MAX_TICKET_PER_EVENT) {

                await t.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Melebihi batas pembelian tiket."
                });

            }
        }

        // Hitung harga
        const total_prices = quantity * ticket.current_price;

        // Simpan transaksi
        const transaction = await Transaction.create({

            quantity,
            total_prices,
            order_date: new Date(),
            transaction_status: "success",
            user_id,
            ticket_id,
            method

        }, {
            transaction: t
        });

        // Update ticket
        await ticket.update({

            ticket_sold: ticket.ticket_sold + quantity

        }, {
            transaction: t
        });

        await t.commit();

        console.log(`[Transaction] Commit sukses. Memulai recalculateTicketPrice untuk ticket_id=${ticket.ticket_id}...`);

        try {

            const updatedTicket = await Ticket.findByPk(ticket.ticket_id);

            if (updatedTicket) {
                await recalculateTicketPrice(db, updatedTicket);
                console.log(`[Transaction] recalculateTicketPrice selesai untuk ticket_id=${ticket.ticket_id}`);
            } else {
                console.log(`[Transaction] updatedTicket tidak ditemukan untuk ticket_id=${ticket.ticket_id}`);
            }

        } catch (err) {

            console.error("[Transaction] Error saat recalculateTicketPrice:", err);

        }

        return res.status(201).json({

            success: true,
            message: "Pembelian berhasil",
            data: transaction

        });

    } catch (err) {

        await t.rollback();

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

