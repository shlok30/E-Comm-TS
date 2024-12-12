import bodyParser from "body-parser"
import { Request, Response } from "express"
import productRouter from "./routes/products"
import categoryRouter from "./routes/category";
import userRouter from "./routes/user"
const adminRouter = require("./routes/admin")
const connectToDb = require("./config/database")
const express = require('express')
const Admin = require("./models/Admin")
const app = express()
const port = 3000

connectToDb()
  .then(()  => console.log("DB Connected"))
  .catch((err : Error) => console.log("Error connecting to DB",err))

app.use(bodyParser.json());
  
app.use("/api/admin",adminRouter);
app.use("/api/products",productRouter);
app.use("/api/categories",categoryRouter);
app.use("/api/users", userRouter);

app.get('/', (req: Request, res:Response) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})