import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class Auth {
    //function to generate and inject refresh and access tokens for current user
    generateTokens = async (userId) => {
        try {
            const user = await User.findById(userId);
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(500, "something went wrong while generating tokens")
        }
    }
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
            username: username.toLowerCase()
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
        if (req.cookies?.accessToken || req.cookies?.refreshToken) {
            throw new ApiError(400, "please log out first")
        }
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
            throw new ApiError(400, "invalid email or password")
        }
        //check if password is correct
        const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "invalid email or password")
        }
        //generate token
        const { accessToken, refreshToken } = await this.generateTokens(existedUser._id);
        //send response in cookies
        const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");
        const options = {
            httpOnly: true,
            secure: true
        }
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
            secure: true
        }
        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, null, "User logged out successfully"))
    })
    //controller to refresh users's access token
    refreshTokens = asyncHandler(async (req, res) => {
        try {
            const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!incomingRefreshToken) {
                throw new ApiError(400, "Refresh token is required")
            }
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id);
            if (!user) {
                throw new ApiError(400, "Invalid refresh token")
            }
            if (incomingRefreshToken !== user.refreshToken) {
                throw new ApiError(400, "refresh token is expired or used")
            }
            const options = {
                httpOnly: true,
                secure: true
            }
            const { accessToken, refreshToken } = this.generateTokens(user._id);
            return res
                .status(200)
                .cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
                    accessToken,
                    refreshToken,
                }, "Access Token refreshed"))
        } catch (error) {
            console.log(error.message)
        }
    })
}
export default new Auth();