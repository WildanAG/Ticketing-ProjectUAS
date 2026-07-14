const express = require("express");
const router = express.Router();

const {
    getOrganizerDashboard,
    getOrganizerTransactions
} = require("../controllers/dashboardOrganizer");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/auth");

router.get(
    "/",
    verifyToken,
    authorizeRoles("eo"),
    getOrganizerDashboard
);

router.get(
    "/organizer",
    verifyToken,
    authorizeRoles("eo"),
    getOrganizerTransactions
);

module.exports = router;