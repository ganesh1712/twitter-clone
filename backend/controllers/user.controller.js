import User from "../models/user.model.js"
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary"
export const getProfile = async(req , res) =>{
    try {
        const {username} = req.params;
        const user = await User.findOne({username})

        if(!user){
            return res.status(400).json({error: "user not found"})
        }

        res.status(200).json(user);

    } catch (error) {
        console.log(`error in get user profile controller: ${error}`)
        res.status(500).json({error:"internal server error"})
    }
}

export const followUnfollowUser = async(req , res)=>{
    try {
        const {id} = req.params;
        const userToModify = await User.findById({_id : id})
        const currentUser = await User.findById({_id : req.user.id})

        if( id === req.user.id){
            return res.status(400).json({error: "you can't unfollow/follow yourself"})
        }

        if ( !userToModify || !currentUser){
            return res.status(400).json({error: "user not found"})
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //unfollow
            await User.findByIdAndUpdate({_id : id}, {$pull:{followers:req.user.id}})
            await User.findByIdAndUpdate({_id : req.user.id}, {$pull:{following:id}})
            res.status(200).json({message: "unfollow successful"})
        }
        else{
            //follow
            await User.findByIdAndUpdate({_id:id}, {$push:{followers:req.user.id}})
            await User.findByIdAndUpdate({_id:req.user.id}, {$push:{following:id}})
            //notification
            const newNotification = new Notification({
                type : "follow",
                from : req.user._id,
                to : userToModify._id
            })
            await newNotification.save();
            res.status(200).json({message: "follow successful"})
        }
    } catch (error) {
        console.log(`error in  follow and unfollow controller: ${error}`)
        res.status(500).json({error:"internal server error"})
    }
}

export const getSuggestedUsers = async (req , res)=>{
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({ _id: userId }).select("-password")

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },{
                $sample: {
                    size: 10
                }
            }
        ])

        const filteredUser = users.filter((user)=> !userFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUser.slice(0,4);
        
        suggestedUsers.forEach((user)=> (user.password = null))
        res.status(200).json(suggestedUsers)
    } catch (error) {
        console.log(`error in  get suggested users controller: ${error}`)
        res.status(500).json({error:"internal server error"})
    }
}

export const updateUser = async (req , res)=>{
    try {
        const userId = req.user._id;
        const {username, fullname, email, currentPassword, newPassword, bio, link} = req.body;
        let {profileImg , coverImg} = req.body;
        
        let user = await User.findById({_id:userId})
        if(!user){
            return res.status(400).json({error: "User not found"})
        }

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            res.status(400).json({error: "please provide both the new password and current password"})
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return res.status(400).json({error : "current password is Incorrect"})
            }
            if(newPassword < 6){
                return res.status(400).json({error: "password must have 6 characters"})
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // if(profileImg){

        //     if(user.profileImg){
        //         await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
        //     }

        //     const uploadedResponse = await cloudinary.uploader.upload(profileImg);
        //     profileImg = uploadedResponse.secure_url;
        // }

        // if(coverImg){

        //     if(user.coverImg){
        //         await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
        //     }

        //     const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        //     coverImg = uploadedResponse.secure_url;
        // }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        user.password = null;

        return res.status(200).json(user);

    } catch (error) {
        console.log(`error in update user users controller: ${error}`)
        res.status(500).json({error:"internal server error"})
    }
}