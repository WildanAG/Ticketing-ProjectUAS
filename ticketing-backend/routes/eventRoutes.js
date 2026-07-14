const express = require('express');
const router = express.Router();
const {
    createEvent,
    getAllEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getCrowdEstimation
} = require('../controllers/eventController');
const uploadEvent = require('../middleware/uploadEvent');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Urutan penting: route spesifik ('/my', '/:id/crowd-estimation') harus di atas '/:id'
router.get('/my', verifyToken, authorizeRoles('eo'), getMyEvents);          // GET  /api/events/my
router.get('/:id/crowd-estimation', getCrowdEstimation);                    // GET  /api/events/:id/crowd-estimation
router.post('/', verifyToken, authorizeRoles('eo'), uploadEvent.single('image'), createEvent); // POST /api/events
router.get('/', getAllEvents);                                              // GET  /api/events (publik)
router.get('/:id', getEventById);                                           // GET  /api/events/:id (publik)
router.patch('/:id', verifyToken, authorizeRoles('eo'), uploadEvent.single('image'), updateEvent);
router.delete('/:id', verifyToken, authorizeRoles('eo'), deleteEvent);


module.exports = router;