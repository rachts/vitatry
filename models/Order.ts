import { Schema, model } from "mongoose"

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  // Other fields can be added here
})

OrderSchema.index({ orderNumber: 1 })

const Order = model("Order", OrderSchema)

export default Order
