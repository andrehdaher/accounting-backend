const mongoose = require('mongoose')

const authSchema = new mongoose.Schema(
{
    fullName: { type: String, trim: true },
    userName: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true },
    phone: { type: String },
    dateCreate: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    balance: { type: Number, default: 0 },
  
},

{
    collation: { locale: 'en', strength: 1 }, // case-insensitive ordering for ASCII letters
}
)

// Ensure efficient alphabetical sorts by userName
authSchema.index({ userName: 1 })

// Hide password when converting to JSON
authSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password
        return ret
    }
})

module.exports = mongoose.model('Auth', authSchema)