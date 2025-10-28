const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/User'); // Adjust the path as necessary
const authMiddleware = require('../middleware/authMiddleware'); // Adjust the path as necessary

const router = express.Router();
// Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { fullName, userName, password, phone } = req.body;
        if (!fullName || !userName || !password) {
            return res.status(400).json({ message: 'الرجاء ملء جميع الحقول المطلوبة' });
        }
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ message: 'اسم المستخدم موجود مسبقاً' });
        }
        const newUser = new User({ fullName, userName, password, phone });
        await newUser.save();
        res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;
        if (!userName || !password) {
            return res.status(400).json({ message: 'الرجاء ملء جميع الحقول المطلوبة' });
        }
        const user = await User.findOne({ userName });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }   
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token , email : userName});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});
router.get('/balance', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }
        res.status(201).json({ balance: user.balance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});


// Export the router so it can be used by app.use('/api/auth', ...)
module.exports = router;