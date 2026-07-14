const express = require('express');
const router = express.Router();
const {
    createTicket,
    getTicketsByEvent,
    getTicketById,
    updateTicket,
    deleteTicket
} = require('../controllers/ticketController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.get('/event/:event_id', getTicketsByEvent);   // publik
router.get('/:id', getTicketById);                    // publik
router.post('/', verifyToken, authorizeRoles('eo'), createTicket);
router.patch('/:id', verifyToken, authorizeRoles('eo'), updateTicket);
router.delete('/:id', verifyToken, authorizeRoles('eo'), deleteTicket);

module.exports = router;