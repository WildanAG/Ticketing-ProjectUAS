const db = require("../models");
const { Op } = require("sequelize");

const getOrganizerDashboard = async (req, res) => {
    try {
        
        const user_id = req.user.user_id;

        // Semua event milik EO
        const events = await db.Event.findAll({
            where: { user_id },
            attributes: ["event_id"]
        });

        const eventIds = events.map(event => event.event_id);

        if (eventIds.length === 0) {
            return res.json({
                success: true,
                data: {
                    totalRevenue: 0,
                    ticketSold: 0,
                    totalAttendees: 0,
                    totalEvents: 0
                }
            });
        }

        // Semua tiket milik event EO
        const tickets = await db.Ticket.findAll({
            where: {
                event_id: {
                    [Op.in]: eventIds
                }
            },
            attributes: ["ticket_id"]
        });

        const ticketIds = tickets.map(ticket => ticket.ticket_id);

        let totalRevenue = 0;
        let ticketSold = 0;

        if (ticketIds.length > 0) {

            totalRevenue = await db.Transaction.sum("total_prices", {
                where: {
                    ticket_id: {
                        [Op.in]: ticketIds
                    },
                    transaction_status: "success"
                }
            }) || 0;

            ticketSold = await db.Transaction.sum("quantity", {
                where: {
                    ticket_id: {
                        [Op.in]: ticketIds
                    },
                    transaction_status: "success"
                }
            }) || 0;
        }

        return res.json({
            success: true,
            data: {
                totalRevenue,
                ticketSold,
                totalAttendees: ticketSold,
                totalEvents: eventIds.length
            }
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const getOrganizerTransactions = async (req, res) => {
    try {

        const user_id = req.user.user_id;

        // Event milik EO
        const events = await db.Event.findAll({
            where: { user_id },
            attributes: ["event_id"]
        });

        const eventIds = events.map(e => e.event_id);

        if (eventIds.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const transactions = await db.Transaction.findAll({
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ["username"]
                },
                {
                    model: db.Ticket,
                    as: "ticket",
                    include: [
                        {
                            model: db.Event,
                            as: "event",
                            where: {
                                event_id: eventIds
                            },
                            attributes: [
                                "event_title"
                            ]
                        }
                    ]
                }
            ],
            order: [
                ["order_date", "DESC"]
            ]
        });

        const result = transactions.map(trx => ({
            transaction_id: trx.transaction_id,
            username: trx.user.username,
            amount: trx.total_prices,
            event: trx.ticket.event.event_title,
            date: trx.order_date,
            category: trx.ticket.ticket_category
        }));

        return res.json({
            success: true,
            data: result
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};


module.exports = {
    getOrganizerDashboard,
    getOrganizerTransactions
};