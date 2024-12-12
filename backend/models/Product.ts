import mongoose, { Schema } from "mongoose";
import { IProduct } from "./types";

const productSchema = new mongoose.Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true}
  });
  
const ProductModel = mongoose.model<IProduct>("Product", productSchema);
  
export default ProductModel;