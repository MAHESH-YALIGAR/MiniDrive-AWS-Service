const express=require("express")
const router=express();
const {userRegister,login,logout}=require("../controller/user.controller");
const Authmidleware=require("../middleware/user.middleware")
router.post("/register",userRegister);
router.post("/login",login);
router.post("/logout",logout)

module.exports=router;