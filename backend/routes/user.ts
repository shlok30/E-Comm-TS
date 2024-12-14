import express, { Request, Response } from "express";
import mongoose from "mongoose";
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
        const newUser = new UserModel({username, password, cart: [], wishlist : []});
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
        const user = await UserModel.findOne({username})?.populate("cart.product");
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
    if (typeof productId !== 'string') {
        res.status(400).json({ message: "Invalid productId. It must be a string." });
        return;
    }
    try{
        const user = await UserModel.findOne({username});
        if(!user){
            res.status(404).json({message: "User not found"});
            return
        }
        //First check if product is already in cart?
        const productAlreadyInCart = user.cart.find(({product: prodId}) => prodId.toString() === productId);
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
        user.cart?.push({product : new mongoose.Types.ObjectId(productId), quantity : 1});
        await user.save();
        res.status(201).json({message: "Product was added to cart!"});
    } catch(e){
        res.status(500).json({message: "Something went wrong!"})
    }
})

router.post('/wishlist', auth, async (req: CustomRequest, res: Response) => {
    const username = req.username;
    const {productId} = req.body;
    if (typeof productId !== 'string') {
        res.status(400).json({ message: "Invalid productId. It must be a string." });
        return;
    }
    try{
        const user = await UserModel.findOne({username});
        if(!user){
            res.status(404).json({message: "User not found"});
            return
        }
        //First check if product is already in Wishlist?
        const productIdxInWishlist = user.wishlist?.findIndex(({product:prodId}) => prodId.toString() === productId);
        if(productIdxInWishlist !== -1){
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
        user.wishlist?.push({product : new mongoose.Types.ObjectId(productId), quantity : 1});
        await user.save();
        res.status(201).json({message: "Product was added to wishlist!"});
    } catch(e){
        res.status(500).json({message: "Something went wrong!"})
    }
})

//Delete from Wishlist/Cart
router.delete("/:type/:productId", auth, async (req: CustomRequest, res: Response) => {
    const username = req.username;
    const { type, productId } = req.params;

    try {
        // Validate the type
        if (!['cart', 'wishlist'].includes(type)) {
            res.status(400).json({ message: "Invalid type specified. Must be 'cart' or 'wishlist'." });
            return;
        }

        // Find the user
        const user = (await UserModel.findOne({ username }))!;

        // Determine the collection to modify
        const targetList = type === "cart" ? user.cart : user.wishlist;

        // Check if the product exists in the target list
        const productToDeleteIdx = targetList.findIndex((prodId) => prodId.toString() === productId);
        if (productToDeleteIdx === -1) {
            res.status(400).json({ message: `Product not found in ${type}` });
            return;
        }

        // Remove the product from the target list
        targetList.splice(productToDeleteIdx, 1);
        await user.save();

        res.status(200).json({ message: `Product was removed from ${type}!` });
    } catch (e) {
        res.status(500).json({ message: "Something went wrong!" });
    }
});

//Increment/Decrement Product from Cart/Wishlist
router.put("/:type/:productId", auth, async (req: CustomRequest, res: Response) => {
    const username = req.username;
    const {type, productId} = req.params;
    const {action} = req.body;
    if(!['cart','wishlist'].includes(type)){
        res.status(400).json({MessageChannel})
        return
    }
    // Validate the 'action' parameter
    if (!['increment', 'decrement'].includes(action)) {
        res.status(400).json({ message: "Invalid action. Must be 'increment' or 'decrement'." });
        return;
    }
    //We are not checking if new quantity exceeds total quantity here. Instead we will not allow user to buy if thats the case
    try{
        const user = (await UserModel.findOne({username}))!;
        const targetList = type === "cart" ? user.cart : user.wishlist;
        const selectedProductIdx = targetList.findIndex(({product : prodId}) => prodId.toString() === productId);
        if (selectedProductIdx === -1) {
            res.status(400).json({ message: `Product not found in ${type}` });
            return;
        }
        const updatedQuantity = action === 'increment' ? targetList[selectedProductIdx].quantity + 1 : targetList[selectedProductIdx].quantity - 1;
        if(updatedQuantity <= 0){
            targetList.splice(selectedProductIdx, 1);
            await user.save();
            res.status(200).json({ message: `Product was removed from ${type}!` });
            return
        }
        //Update quantity
        targetList[selectedProductIdx].quantity = updatedQuantity;
        await user.save();
        res.status(200).json({message: `Product quantity was ${action}ed in ${type}`});
    } catch(e){
        res.status(500).json({ message: "Something went wrong!" });
    }
})

export default router;