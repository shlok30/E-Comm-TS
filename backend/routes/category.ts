import { Request, Response } from "express";
import express from "express"
import CategoryModel from "../models/Category";
import auth from "../middleware/auth";

const router = express.Router();

router.get("/",async (req : Request,res : Response) => {
    try{
        const categories =  await CategoryModel.find();
        res.status(200).json({categories : categories});
    } catch(e) {
        res.status(500).json({message: "Something went wrong, please try again"});
    }
})

router.post("/", auth, async (req : Request,res : Response) => {
    const {label} = req.body;
    try{
        const newCategory = new CategoryModel({label});
        await newCategory.save();
        res.status(201).json({message: "Category has been added"});
    } catch(e) {
        res.status(500).json({message: "Something went wrong, please try again"});
    }
})

export default router;