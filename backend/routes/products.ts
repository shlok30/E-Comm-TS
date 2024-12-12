import { Request, Response } from "express";
import express from "express"
import auth from "../middleware/auth";

import Admin from "../models/Admin"
import adminSchema, { productSchema } from "../models/types";
import { getValidationError } from "../utils";
import ProductModel from "../models/Product";


const jwt = require("jsonwebtoken");
require('dotenv').config();

const router = express.Router()

router.get("/", async (req : Request,res : Response) => {
    try{
        const products = await ProductModel.find().populate("category","label");
        res.status(200).json({products : products});
    } catch(e) {
        res.status(500).json({message: "Something went wrong, please try again"});
    }
})

export default router;