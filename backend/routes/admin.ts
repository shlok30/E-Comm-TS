import { Request, Response } from "express";
import express from "express"
import auth from "../middleware/auth";

import Admin from "../models/Admin"
import adminSchema, { productSchema } from "../models/types";
import { getValidationError } from "../utils";
import ProductModel from "../models/Product";


const jwt = require("jsonwebtoken");
require('dotenv').config();

const adminSecretKey = process.env["ADMIN_SECRET_KEY"];

const router = express.Router()

router.post("/signup",async (req : Request,res : Response) => {
    const {username, password} = req.body
    const validation = adminSchema.safeParse({username, password});
    if(!validation.success){
        res.status(400).json({message : getValidationError(validation.error)});
        return
    }
    try{
        const usernameExists = await Admin.findOne({username});
        if(usernameExists){
            res.status(400).json({"message" : "Username already exists"});
            return
        }
        const newAdmin = new Admin({username, password})
        await newAdmin.save()
        res.status(201).json({message : "Admin created successfully"})
    } catch(e){
        res.status(500).json({"message": "Something went wrong, please try again"});
    }
});

router.post("/login",async (req : Request, res: Response) => {
    const {username, password} = req.body;
    const validation = adminSchema.safeParse({username, password});
    if(!validation.success){
        res.status(400).json({message : getValidationError(validation.error)});
        return
    }
    try{
        const userFound = await Admin.findOne({username, password});
        if(userFound){
            const payload = {username : userFound["username"], isAdmin : true}
            const token = jwt.sign(payload,adminSecretKey,{expiresIn : "1h"})
            res.json({message : "Logged in successfully", token})
        }
        else
            res.status(404).json({error : "Invalid credentials"})
    } catch(e){
        res.status(500).json({error : "Something went wrong, please try again"})
    }

})

router.post("/products",auth,async (req : Request,res: Response) => {
    const {name, description, price, quantity, category} = req.body;
    const validation = productSchema.safeParse({name,description, price, quantity, category});
    if(!validation.success){
        res.status(400).json({message : getValidationError(validation.error)});
        return
    }
    try{
        const newProduct = new ProductModel({name, description, price, quantity, category});
        await newProduct.save();
        res.status(201).json({message : "Product was added succesfully"});
    } catch(e){
        res.status(500).json({message: "Something went wrong, please try again"});
    }
})

router.put("/products/:productId", auth, async (req : Request, res : Response) => {
    const {productId} = req.params;
    const {name, description, price, quantity} = req.body;
    const validation = productSchema.safeParse({name,description, price, quantity});
    if(!validation.success){
        res.status(400).json({message : getValidationError(validation.error)});
        return
    }
    try{
        const product = await ProductModel.findByIdAndUpdate(productId, {name, description, price, quantity});
        if(!product){
            res.status(404).json({error : "Product not found"})
            return
        }
        res.status(201).json({message: "Product was successfully updated"});
    } catch(e){
        res.status(500).json({message: "Something went wrong, please try again"});
    }
})

module.exports = router;