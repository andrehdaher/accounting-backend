const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    barcode: {
      type: String,
      trim: true,
      unique: true, // كل منتج له كود فريد
      sparse: true, // يسمح بوجود منتجات بدون باركود
    },

    category: {
      type: String,
      trim: true,
      default: "غير مصنف",
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    unit: {
      type: String,
      enum: ["قطعة", "كغ", "متر", "علبة", "وحدة أخرى"],
      default: "قطعة",
    },

    supplier: {
      type: String,
      trim: true,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    priceJ: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    rest:{
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },



    status: {
      type: String,
      enum: ["cash", "postpaid"],
      default: "cash",
    },
  },
  {
    timestamps: true, // يضيف تلقائياً createdAt و updatedAt
  }
);

module.exports = mongoose.model("Item", itemSchema);
