import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import registerRoutes from './routes/registerRoutes.js';
import loginRoutes from "./routes/loginRoutes.js"
import mainRoute from "./routes/mainRoute.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import homepageRoutes from "./routes/homeRoutes.js"
import paymentRoutes from './routes/paymentRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import session from 'express-session';
import flatRoutes from './routes/flatRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import MongoStore from 'connect-mongo';
import User from './models/User.js';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/homify',
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }
}));

// Setting EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Routes

app.use(async (req, res, next) => {
    if (req.session.user) {
        const user = await User.getUserById(req.session.user.id);
        if (user) {
            req.session.user = {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                address: user.address,
                o_flag: user.o_flag,
                t_flag: user.t_flag,
                tenant_flat_id: user.tenant_flat_id,
            };
        }
    }
    next();
});

app.use(registerRoutes);
app.use(loginRoutes);
app.use(dashboardRoutes);
app.use(homepageRoutes);
app.use('/owner', ownerRoutes);
app.use('/flats', flatRoutes);
app.use(mainRoute);

app.use(paymentRoutes);
app.use(maintenanceRoutes);

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
