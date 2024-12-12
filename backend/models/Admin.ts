import mongoose from 'mongoose';
import { IAdmin } from './types';


const schema = new mongoose.Schema<IAdmin>({
    username : {type: "string", required : true},
    password : {type: "string", required : true}
})

const Admin = mongoose.model<IAdmin>("Admin",schema)

export default Admin
