import express, { Request, Response } from "express";
import { userZodSchema } from "../models/types";
import { getValidationError } from "../utils";
import UserModel from "../models/User";
import auth from "../middleware/auth";
import { CustomRequest } from "../types";
import ProductModel from "../models/Product";

const router = express.Router();
const jwt = require("jsonwebtoken");
require('dotenv').config();

const userSecretKey = process.env["USER_SECRET_KEY"];

router.post("/signup",async (req : Request, res: Response) => {
    const {username, password} = req.body
    const validation = userZodSchema.safeParse({username, password});
    if(!validation.success){
        res.status(400).json({message : getValidationError(validation.error)});
        return
    }
    try{
        const usernameExists = await UserModel.findOne({username});
        if(usernameExists){
            res.status(400).json({message : "Username already exists!"});
            return
        }
        const newUser = new UserModel({username, password});
        await newUser.save()
        res.status(201).json({message : "Admin created successfully"})
    } catch(e){
        res.status(500).json({"message": "Something went wrong, please try again"});
    }
})

router.post("/login", async (req: Request, res: Response) => {
    const {username, password} = req.body;
    const validation = userZodSchema.safeParse({username, password});
    if(!validation.success){
        res.status(400).json({message : getValidationError(validation.error)});
        return
    }
    try{
        const userFound = await UserModel.findOne({username, password});
        if(userFound){
            const payload = {username : userFound["username"]};
            const token = jwt.sign(payload,userSecretKey,{expiresIn : "1h"});
            res.json({message : "Logged in successfully", token});
        }
        else
            res.status(404).json({error : "Invalid credentials"});
    } catch(e){
        res.status(500).json({error : "Something went wrong, please try again"});
    }
})

router.get("/", auth, async (req : CustomRequest, res : Response) => {
    const username = req.username;
    try{
        const user = await UserModel.findOne({username})?.populate("cart");
        if(user){
            res.status(200).json({user});
            return
        }
        res.status(404).json({message: "User not found"});
    } catch(e){
        res.status(500).json({message: "Something went wrong!"})
    }
})

router.post("/cart",auth, async (req: CustomRequest, res: Response) => {
    const username = req.username;
    const {productId} = req.body;
    try{
        const user = await UserModel.findOne({username});
        if(!user){
            res.status(404).json({message: "User not found"});
            return
        }
        //First check if product is already in cart?
        const productAlreadyInCart = user.cart?.includes(productId);
        if(productAlreadyInCart){
            res.status(400).json({message: "Product already in cart!"});
            return
        }
        //Second check if selected product is available?
        const selectedProduct = await ProductModel.findById(productId);
        if(!selectedProduct){
            res.status(400).json({message: "No Such Product Exists"});
            return;
        }
        //If product exists then is it even available
        if(!selectedProduct.quantity){
            res.status(400).json({message: "Product is out of stock"});
            return;
        }
        //Add to cart with 1 quantity
        user.cart?.push(productId);
        await user.save();
        res.status(201).json({message: "Product was added to cart!"});
    } catch(e){
        res.status(500).json({message: "Something went wrong!"})
    }
})

router.post('/wishlist', auth, async (req: CustomRequest, res: Response) => {
    const username = req.username;
    const {productId} = req.body;
    try{
        const user = await UserModel.findOne({username});
        if(!user){
            res.status(404).json({message: "User not found"});
            return
        }
        //First check if product is already in cart?
        const productAlreadyInWishlist = user.wishlist?.includes(productId);
        if(productAlreadyInWishlist){
            res.status(400).json({message: "Product already in wishlist!"});
            return
        }
        //Second check if selected product is available?
        const selectedProduct = await ProductModel.findById(productId);
        if(!selectedProduct){
            res.status(400).json({message: "No Such Product Exists"});
            return;
        }
        //Add to wishlist with 1 quantity
        user.wishlist?.push(productId);
        await user.save();
        res.status(201).json({message: "Product was added to wishlist!"});
    } catch(e){
        res.status(500).json({message: "Something went wrong!"})
    }
})

//Delete from Cart
//Delete from Wishlist

export default router;