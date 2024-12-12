import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

require('dotenv').config();

// const jwt = require("jsonwebtoken");
const express = require("express");

interface CustomRequest extends Request {
    username?: string
}

function auth(req : CustomRequest, res : Response,next : NextFunction){
    const {authorization} = req.headers;
    const token = authorization?.split(" ")[1];
    if(!token){
        res.status(403).json({message: "User is not authorized to access this data"});
        return;
    }
    try{
        const payload = jwt.decode(token);
        let secretKey = '';
        let username = '';
        if(payload && typeof payload === 'object'){
            secretKey = payload.isAdmin ? "ADMIN_SECRET_KEY" : "USER_SECRET_KEY";
            username = payload.username;
        }
        jwt.verify(token,process.env[secretKey]!);
        req.username = username;
        next();
    } catch(e){
        res.status(403).json({message: "User is not authorized to access this data"});
    }   
}

export default auth;