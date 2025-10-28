const Purchase = require('../models/Purchase')
const express = require('express')
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router()

router.get("/daily-purchase", authMiddleware, async (req, res) => {
  try {
    // قراءة التاريخ المطلوب من الواجهة الأمامية، أو اعتماد تاريخ اليوم افتراضيًا
    const date = req.query.date ? new Date(req.query.date) : new Date();

    // تحديد بداية ونهاية اليوم (من 00:00 إلى 23:59)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // جلب الفواتير التي تم إنشاؤها في هذا اليوم فقط
    const Purchases = await Purchase.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    res.status(200).json(Purchases);
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الفواتير اليومية:", err);
    res.status(500).json({ message: "❌ حدث خطأ أثناء جلب الفواتير اليومية" });
  }
});

// 📅 جلب الفواتير بين تاريخين
router.get("/range-purchase", authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "يرجى تحديد كل من تاريخ البداية والنهاية." });
    }

    // تحويل النصوص إلى تواريخ
    const startDate = new Date(from);
    const endDate = new Date(to);

    // ضبط نطاق البحث ليشمل اليوم الأخير بالكامل
    endDate.setHours(23, 59, 59, 999);

    // البحث عن الفواتير التي تم إنشاؤها ضمن هذا النطاق
    const Purchases = await Purchase.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    res.status(200).json(Purchases);
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الفواتير حسب النطاق:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الفواتير حسب النطاق." });
  }
});


module.exports = router;
