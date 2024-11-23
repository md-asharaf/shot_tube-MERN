import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class Auth {

    googleSignIn = asyncHandler(async (req, res) => {
        const { email, fullname, avatar, idToken } = req.body;
        if (!email || !fullname) {
            throw new ApiError(400, "Email and Fullname are required")
        }
        const user = await User.findOne({ email }) || await User.create({
            email,
            fullname,
            username: email.split("@")[0],
            password: "1111111111"
        });
        user.avatar = avatar;
        user.idToken = idToken;
        await user.save({ validateBeforeSave: false });
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "none"
        }
        return res.status(200).cookie("idToken", idToken, options).json(new ApiResponse(200, { user }, "User logged in successfully"))
    })
    //controller to register a user
    registerUser = asyncHandler(async (req, res) => {
        //get user details from front-end or postman
        const { username, email, password, fullname } = req.body;
        //validation
        if (
            [username, email, password, fullname].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required");
        }
        //check if user exists
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existedUser) {
            throw new ApiError(400, "User already exists")
        }
        //create user object - create entry in db
        const user = await User.create({
            email,
            password,
            fullname,
            username: username.toLowerCase(),
            avatar: "https://shot-tube-videos.s3.ap-south-1.amazonaws.com/profile.png"
        })
        //remove password and refresh token fields from response
        const createdUser = await User.findById(user._id)?.select("-password -refreshToken");
        //check for response
        if (!createdUser) {
            throw new ApiError(500, "Failed to create user");
        }
        //send response
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User created successfully")
        )
    })
    //controller to login a user
    loginUser = asyncHandler(async (req, res) => {
        //get user details from front-end or postman
        const { email, password } = req.body;
        //validate details
        if (!email) {
            throw new ApiError(400, "email is required")
        }
        if (!password) {
            throw new ApiError(400, "password is required")
        }
        //check if user exists
        const existedUser = await User.findOne({ email });
        if (!existedUser) {
            throw new ApiError(400, "invalid email")
        }
        //check if password is correct
        const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "invalid password")
        }
        //generate token
        const accessToken = await existedUser.generateAccessToken();
        const refreshToken = await existedUser.generateRefreshToken();
        console.log("Access Token", accessToken, "RefreshToken", refreshToken)
        //send response in cookies
        const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "none"
        };
        return res
            .cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken,
            }, "user logged in successfully"))
    })
    //controller to logout a user
    logoutUser = asyncHandler(async (req, res) => {
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: 10 * 60 * 60 * 1000,
            sameSite: "none"
        };
        return res.status(200).clearCookie("idToken", options).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, null, "User logged out successfully"))
    })

}
export default new Auth();