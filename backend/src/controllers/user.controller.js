import asynchandler from "../utils/asyncHandler.js"
import ApiErrors from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { useReducer } from "react"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = useReducer.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiErrors("Something went wrong on generating Access and Refresh Token");
    }
}

//check all the user details from frontend 
//validate details - is empty
//check for existing user 
//check for images and avatar compulsion
//upload them into cloudinary
//user details sent to database
//remove password and refresh token in response 
//return the response

const registerUser = asynchandler( async (req,res) => {
    const {fullname,email,password,username} = req.body
    console.log("email : ",email)
    
    // return res.status(404).json({
    //     message:"Something went wrong while registering user"
    // })
    if (
        [fullname, username, email, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiErrors(404,"Fill all the details")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(existedUser){
        throw new ApiErrors(409,"User already exists with this email or username")
    }

    console.log("req.files : ",req.files)
    //req.files will have the uploaded files from multer middleware
     
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiErrors(404,"avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiErrors(500,"Error uploading avatar to cloudinary")
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiErrors(500,"Error while creating user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )
})

//check all the user details in frontend
//validate details - is empty
//check for existing user
//check password match
//access and refresh token
//send cookies in response
//return the response

const loginUser = asynchandler(async (req,res) => {
    const {email,username,password} = req.body
    if(!username || !email){
        throw new ApiErrors(404,"Email or username is required");
    }
    if(!password){
        throw new ApiErrors(404,"Password is required");
    }

    const user = await User.findOne({
        $or : [{username} , {email}]
    })

    if(!user){
        throw new ApiErrors(404,"User not found!!! Please register")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiErrors(401,"Invalid Password")
    }

    await generateAccessAndRefreshToken(user._id)

    const loggedINUser = await User.findById(user.id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true,
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{user :loggedINUser,refreshToken,accessToken},"User logged in successfully"))
})

const logoutUser = asynchandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                refreshToken:undefined,
            }
        },
        {new:true}
    )

    const options = {
        httpOnly:true,
        secure:true,
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})




export {registerUser,loginUser,logoutUser}
