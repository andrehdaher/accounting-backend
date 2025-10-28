const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Item = require("../models/Item");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
// ✅ إنشاء فاتورة جديدة وخصم الكميات
router.post("/addInvoice", authMiddleware, async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "الفاتورة فارغة" });

    // ✅ التحقق من توافر الكميات قبل البيع
    for (const soldItem of items) {
      const product = await Item.findOne({ name: soldItem.name });
      if (!product) {
        return res.status(404).json({ message: `المنتج ${soldItem.name} غير موجود` });
      }

      if (soldItem.quantity > product.stock) {
        return res.status(400).json({
          message: `❌ الكمية المطلوبة (${soldItem.quantity}) من المنتج "${soldItem.name}" أكبر من الكمية المتاحة (${product.stock})`,
        });
      }
    }

    // ✅ إذا وصلنا هنا، كل الكميات كافية
    const invoice = new Invoice({
      items,
      total,
      createdBy: req.user.id,
    });

    await invoice.save();

    // ✅ خصم الكميات من المنتجات
    for (const soldItem of items) {
      const product = await Item.findOne({ name: soldItem.name });
      product.stock -= soldItem.quantity;
      await product.save();
    }
    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: total } });


    res.json({
      message: "✅ تم حفظ الفاتورة وخصم الكميات بنجاح",
      invoice,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ حدث خطأ أثناء حفظ الفاتورة" });
  }
});

router.get("/daily", authMiddleware, async (req, res) => {
  try {
    // قراءة التاريخ المطلوب من الواجهة الأمامية، أو اعتماد تاريخ اليوم افتراضيًا
    const date = req.query.date ? new Date(req.query.date) : new Date();

    // تحديد بداية ونهاية اليوم (من 00:00 إلى 23:59)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // جلب الفواتير التي تم إنشاؤها في هذا اليوم فقط
    const invoices = await Invoice.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    res.status(200).json(invoices);
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الفواتير اليومية:", err);
    res.status(500).json({ message: "❌ حدث خطأ أثناء جلب الفواتير اليومية" });
  }
});

// 📅 جلب الفواتير بين تاريخين
router.get("/range", authMiddleware, async (req, res) => {
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
    const invoices = await Invoice.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    res.status(200).json(invoices);
  } catch (err) {
    console.error("❌ خطأ أثناء جلب الفواتير حسب النطاق:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الفواتير حسب النطاق." });
  }
});


module.exports = router;
