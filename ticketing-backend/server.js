const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
require('dotenv').config(); 
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:3000', 'http://localhost:8081'];

app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (seperti mobile apps / curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // baru
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple logger for transaction requests to help debug mobile POSTs
app.use((req, res, next) => {
    if (req.method === 'POST' && req.path.startsWith('/api/transactions')) {
        console.log('[Request Logger] %s %s - body:', req.method, req.originalUrl, req.body);
    }
    next();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoute = require("./routes/dashboardRoutes");
const dashboardOrganizerRoute = require("./routes/dashboardOrganizerRoutes");
const reportRoutes = require("./routes/reportRoutes");



const PORT = 3001;

// Mounting Routes
app.use('/api/auth', authRoutes); // Akses lewat: http://localhost:3001/api/auth
app.use('/api/users', userRoutes); // Akses lewat: http://localhost:3001/api/users
app.use('/api/events', eventRoutes); // Akses lewat: http://localhost:3001/api/events
app.use('/api/tickets', ticketRoutes); // Akses lewat: http://localhost:3001/api/tickets
app.use('/api/transactions', transactionRoutes); // Akses lewat: http://localhost:3001/api/transactions
app.use("/api/dashboard", dashboardRoute);
app.use("/api/dashboard/organizer", dashboardOrganizerRoute);
app.use("/api/reports", reportRoutes);

// Test & Sync Database Connection
sequelize.authenticate()
    .then(async () => {
        console.log('Database connection has been established successfully.');        

        // Base Route
        app.get('/', (req, res) => {
            res.send('Welcome to the Ticketing Backend API');
        });

        // Start Server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });