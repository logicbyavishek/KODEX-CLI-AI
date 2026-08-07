import expres from "express"
import dotenv from "dotenv"

dotenv.config();

const app = expres();

app.get("/hello",(req,res)=>{
    res.send("Hello from server")
})

app.listen(process.env.PORT,()=>{
    console.log(`Your Application is Running on http://localhost:${process.env.PORT}`)
})