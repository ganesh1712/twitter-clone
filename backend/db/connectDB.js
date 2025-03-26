import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MangoDB connected");
    } catch (error) {
        console.log(`Error in connecting Db: ${error}`)
        process.exit(1)
    }
}
123
export default connectDB;