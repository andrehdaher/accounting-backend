const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    items: [
      {
        name: { type: String, required: true },
        category: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number },
      },
    ],
    total: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
