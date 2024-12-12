import mongoose, { Schema } from "mongoose";
import { IUser } from "./types";

const userSchema = new mongoose.Schema<IUser>({
    username : {type: "string", required: true},
    password : {type: "string", required : true},
    cart: {type: [Schema.Types.ObjectId], ref: "Product", required : true},
    wishlist : {type: [Schema.Types.ObjectId], required: true}
})

const UserModel = mongoose.model<IUser>('User',userSchema);

export default UserModel;