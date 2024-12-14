import mongoose, { Schema } from "mongoose";
import { IUser } from "./types";

const userSchema = new mongoose.Schema<IUser>({
    username : {type: "string", required: true},
    password : {type: "string", required : true},
    cart: [{product : {type: Schema.Types.ObjectId, required : true, ref : "Product"} , quantity : {type: "number", required: true, default : 1}}],
    wishlist : [{product : {type: Schema.Types.ObjectId, required : true, ref : "Product"} , quantity : {type: "number", required: true, default : 1}}]
})

const UserModel = mongoose.model<IUser>('User',userSchema);

export default UserModel;