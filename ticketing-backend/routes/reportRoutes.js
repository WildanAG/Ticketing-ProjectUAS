const express = require("express");
const router = express.Router();

const {
    createReport,
    getAllReports,
    getReportById,
    deleteReport
} = require("../controllers/reportController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/auth");

// User membuat report
router.post(
    "/",
    verifyToken,
    authorizeRoles("user"),
    createReport
);

// Admin melihat semua report
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    getAllReports
);

// Admin melihat detail report
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    getReportById
);

// Admin menghapus report
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteReport
);

module.exports = router;