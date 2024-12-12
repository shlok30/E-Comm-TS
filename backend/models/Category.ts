import mongoose from "mongoose";
import { ICategory } from "./types";

const categorySchema = new mongoose.Schema<ICategory>({
    label: { type: String, required: true },
  });
  
const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);
  
export default CategoryModel;