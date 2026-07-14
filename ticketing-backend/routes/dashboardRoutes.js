const express = require("express");
const router = express.Router();

const { getDashboard } = require("../controllers/dashboardAdmin");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

router.get(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    getDashboard
);

module.exports = router;