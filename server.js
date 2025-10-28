const express = require("express");
const dotenv = require("dotenv")
const cors = require("cors");   
const invoiceRoutes = require("./routes/invoiceRoutes");
const purchaseRoutes = require('./routes/purchaseInvoices')
const mongoose = require('mongoose')
dotenv.config()




const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', require('./controllers/auth'))
app.use('/api', require('./routes/addItem'))
app.use("/api/invoices", invoiceRoutes);
app.use("/api/purchase", purchaseRoutes);


async function startServer() {
    try {
        const MONGO_URI = process.env.MONGO_URI
        if (!MONGO_URI) {
            throw new Error('MONGODB_URI is not set in .env')
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not set in .env')
        }

        await mongoose.connect(MONGO_URI)
        console.log('Connected to MongoDB')

        const port = process.env.PORT || 5000
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    } catch (err) {
        console.error('Failed to start server:', err.message)
        process.exit(1)
    }
}

startServer()