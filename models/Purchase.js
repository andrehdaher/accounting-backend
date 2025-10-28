const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    name : {type : String , required :true},
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'postpaid'], required: true },
    amountPaid: { type: Number, default: 0 },
    rest: { type: Number, default: 0 },
    notes: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // يمكنك تعديلها حسب نظام المستخدمين عندك
    },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
  },
  { timestamps: true } // 🕓 لحفظ وقت العملية تلقائيًا
);

module.exports = mongoose.model('Purchase', purchaseSchema);
