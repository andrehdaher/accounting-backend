const express = require('express');
const Item = require('../models/Item'); // ✅ تأكد من وجود هذا المسار الصحيح
const authMiddleware = require('../middleware/authMiddleware');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const router = express.Router();

// 📦 إضافة منتج جديد
router.post('/addItem', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      barcode,
      category,
      description,
      unit,
      supplier,
      costPrice,
      road,
      priceJ,
      price,
      amountPaid,
      stock,
      minStock,
      createdBy,
    } = req.body;
    let rest = 0;

    // ✅ التحقق من الحقول الأساسية
    if (!name || !costPrice || !price || !priceJ) {
      return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة.' });
    }
    const totalPrice = stock * costPrice;
    if (amountPaid > totalPrice) {
      return res.status(400).json({ message: 'المبلغ المدفوع لا يمكن أن يكون أكبر من السعر الإجمالي.' });
    }
    if(totalPrice >amountPaid){
      rest = totalPrice - amountPaid;
    }else{
      rest =0;
    }

    // ✅ إنشاء المنتج الجديد
    const newItem = new Item({
      name,
      barcode,
      category,
      description,
      unit,
      status: road,
      supplier,
      costPrice,
      amountPaid,
      priceJ,
      price,
      total: totalPrice,
      stock,
      rest,
      minStock,
      createdBy,
    });

    // ✅ حفظه في قاعدة البيانات
    const savedItem = await newItem.save();

    res.status(201).json({
      message: 'تم حفظ المنتج بنجاح ✅',
      item: savedItem,
    });
  } catch (err) {
    console.error('❌ خطأ أثناء حفظ المنتج:', err);
    res.status(500).json({ message: 'حدث خطأ في الخادم', error: err.message });
  }
});



// 📋 عرض جميع المنتجات مع إمكانية البحث
router.get('/items', authMiddleware, async (req, res) => {
  try {
    const { name, barcode, category, supplier } = req.query;

    // 🧠 بناء فلتر ديناميكي حسب حقول البحث
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (barcode) filter.barcode = { $regex: barcode, $options: 'i' };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (supplier) filter.supplier = { $regex: supplier, $options: 'i' };

    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('❌ خطأ أثناء جلب المنتجات:', err);
    res.status(500).json({ message: 'حدث خطأ في الخادم', error: err.message });
  }
});

router.delete('/deleteItems/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    res.json({ message: 'تم حذف المنتج بنجاح ✅' });
  } catch (err) {
    console.error('❌ خطأ أثناء حذف المنتج:', err);
    res.status(500).json({ message: 'حدث خطأ في الخادم', error: err.message });
  }
});


router.put("/updateItem/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "خطأ في تعديل المنتج" });
  }
});


// 🛒 تسجيل عملية شراء جديدة
router.post('/items/buy/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params;
    const { name , quantity, price, paymentMethod, amountPaid, notes } = req.body;
    console.log(req.body)
    // ✅ التحقق من الكمية
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'الكمية غير صالحة' });
    }

    // ✅ جلب المنتج
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    // ✅ الحسابات الأساسية
    const unitPrice = price || item.costPrice;
    const total = Number(quantity) * Number(unitPrice);
    const paid = paymentMethod === 'cash' ? total : Number(amountPaid) || 0;
    const rest = total - paid;

  
    // ✅ إنشاء سجل شراء جديد
    const purchase = new Purchase({
      name,
      item: item._id,
      quantity,
      price: unitPrice,
      total,
      paymentMethod : paymentMethod,
      amountPaid: paid,
      rest,
      notes,
      user: req.user?._id, // 🧠 إذا كان authMiddleware يضيف req.user
    });
    await purchase.save();

    // ✅ تحديث مخزون المنتج فقط
    item.stock += Number(quantity);
    item.costPrice = unitPrice; // تحديث سعر التكلفة إذا لزم الأمر
    item.status = paymentMethod;
    item.amountPaid += Number(amountPaid);
    item.total += Number(total) 
    await item.save();

    const user = await User.findById(userId);
    if(user){
      user.balance -= total;
      await user.save();
    }

    

    res.status(201).json({
      message: '✅ تمت عملية الشراء بنجاح',
      purchase,
      updatedStock: item.stock,
    });
    
  } catch (err) {
    console.error('❌ خطأ أثناء عملية الشراء:', err);
    res.status(500).json({ message: 'حدث خطأ في الخادم', error: err.message });
  }
});






module.exports = router;
