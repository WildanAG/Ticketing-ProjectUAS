const db = require("../models");

const Report = db.Report;
const User = db.User;
const Event = db.Event;

// ===========================
// CREATE REPORT
// ===========================
const createReport = async (req, res) => {
    try {

        const { category, description, event_id } = req.body;

        if (!category || !description || !event_id) {
            return res.status(400).json({
                success: false,
                message: "Semua field wajib diisi."
            });
        }

        const event = await Event.findByPk(event_id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event tidak ditemukan."
            });
        }

        const report = await Report.create({
            category,
            description,
            report_date: new Date(),
            user_id: req.user.user_id,
            event_id
        });

        return res.status(201).json({
            success: true,
            message: "Laporan berhasil dikirim.",
            data: report
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// ===========================
// GET ALL REPORT (ADMIN)
// ===========================
const getAllReports = async (req, res) => {
    try {

        const reports = await Report.findAll({

            include: [

                {
                    model: User,
                    as: "user",
                    attributes: ["user_id", "username", "email"]
                },

                {
                    model: Event,
                    as: "event",
                    attributes: ["event_id", "event_title", "user_id"],
                    include: [
                        {
                            model: User,
                            as: "organizer",
                            attributes: ["username"]
                        }
                    ]
                }

            ],

            order: [["report_date", "DESC"]]

        });

        return res.status(200).json({
            success: true,
            data: reports
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// ===========================
// GET REPORT BY ID
// ===========================
const getReportById = async (req, res) => {

    try {

        const report = await Report.findByPk(req.params.id, {

            include: [

                {
                    model: User,
                    as: "user",
                    attributes: ["username", "email"]
                },

                {
                    model: Event,
                    as: "event",
                    attributes: ["event_title"]
                }

            ]

        });

        if (!report) {

            return res.status(404).json({
                success: false,
                message: "Report tidak ditemukan."
            });

        }

        return res.json({
            success: true,
            data: report
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ===========================
// DELETE REPORT
// ===========================
const deleteReport = async (req, res) => {

    try {

        const report = await Report.findByPk(req.params.id);

        if (!report) {

            return res.status(404).json({
                success: false,
                message: "Report tidak ditemukan."
            });

        }

        await report.destroy();

        return res.json({
            success: true,
            message: "Report berhasil dihapus."
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    deleteReport
};