const db = require("../models");
const { Sequelize } = require("sequelize");

exports.getDashboard = async (req, res) => {
    try {

        // Dummy Revenue
        const revenue = 12000000;

        // Total tiket terjual
        const ticketSold = await db.Transaction.sum("quantity", {
            where: {
                transaction_status: "success"
            }
        }) || 0;

        // Jumlah akun EO
        const eoCount = await db.User.count({
            where: {
                role: "eo"
            }
        });

        // Jumlah akun User
        const userCount = await db.User.count({
            where: {
                role: "user"
            }
        });

        // Jumlah user pending approval
        const pendingCount = await db.User.count({
            where: {
                status: "pending"
            }
        });

        // Jumlah event
        const eventCount = await db.Event.count();

        return res.status(200).json({
            success: true,
            data: {
                revenue,
                ticketSold,
                eoCount,
                userCount,
                pendingCount,
                eventCount
            }
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};