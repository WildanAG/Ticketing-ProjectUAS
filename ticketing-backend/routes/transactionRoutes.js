const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");

router.post("/buy", transactionController.createTransaction);
router.get("/my", transactionController.getAllTransactionsByUser);
router.get("/all", transactionController.getAllTransactions);


module.exports = router;