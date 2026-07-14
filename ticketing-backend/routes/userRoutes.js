const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getAllOrganizers,
    getPendingOrganizers,
    approveOrganizer,
    rejectOrganizer,
    updateStatus,
    registerOrganizer,
    registerUser,
    editUser
} = require('../controllers/userController');
const uploadCv = require('../middleware/uploadCv');

router.get('/', getAllUsers);                                        // GET  /api/users
router.get('/organizers', getAllOrganizers);                         // GET  /api/users/organizers
router.get('/pending', getPendingOrganizers);                        // GET  /api/users/pending
router.patch('/:id/approve', approveOrganizer);                     // PATCH /api/users/:id/approve
router.patch('/:id/reject', rejectOrganizer);                       // PATCH /api/users/:id/reject
router.patch('/:id', updateStatus);                                  // PATCH /api/users/:id
router.post('/organizers/register', uploadCv.single('cv'), registerOrganizer); // POST /api/users/organizers/register
router.post('/register', registerUser); // POST /api/users/register
router.patch('/users/:id', editUser);

module.exports = router;