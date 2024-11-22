import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    createPost,
    deletePost,
    createComment,
    likeUnlikePost,
    getAllPosts,
    getLikedPosts,
    getfollowingPosts,
    getUserPosts
} from "../controllers/post.controllers.js";

const router = express.Router();

router.get("/all" , protectRoute , getAllPosts)
router.get("/likes/:id" , protectRoute , getLikedPosts)
router.get("/following" , protectRoute , getfollowingPosts)
router.get("/user/:username" , protectRoute , getUserPosts)
router.post("/create" , protectRoute , createPost)
router.post("/like/:id" , protectRoute , likeUnlikePost)
router.post("/comment/:id" , protectRoute , createComment)
router.delete("/deletepost/:id" , protectRoute , deletePost)


export default router;