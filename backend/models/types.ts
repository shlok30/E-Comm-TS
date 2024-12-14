import { Document, Schema } from "mongoose";
import {any, z} from "zod";

const adminSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const productSchema = z.object({
    name : z.string(),
    description: z.string(),
    quantity: z.number(),
    price: z.number(),
    category: z.string()
})

export const categorySchema = z.object({
    label: z.string(),
})

export const userZodSchema = z.object({
    username: z.string(),
    password: z.string(),
    cart: z.array(z.string()).optional(),
    wishlist: z.array(z.string()).optional()
})

export interface IAdmin extends z.infer<typeof adminSchema>,Document{}

export interface IProduct extends Omit<z.infer<typeof productSchema>, 'category'>,Document{
    category: Schema.Types.ObjectId
}

export interface ICategory extends z.infer<typeof categorySchema>,Document{}

interface ICart {
    product : Schema.Types.ObjectId[],
    quantity: number
}

export interface IUser extends Omit<z.infer<typeof userZodSchema>, 'cart' | 'wishlist'>, Document{
    cart: ICart[],
    wishlist: Schema.Types.ObjectId[]
}

export default adminSchema