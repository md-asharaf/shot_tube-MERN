import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/handler.js";
class AuthController {
    googleSignIn = asyncHandler(async (req, res) => {
        const { email, fullname, avatar, idToken } = req.body;
        if (!email || !idToken) {
            throw new ApiError(400, "Email and idToken is required")
        }
        let user;
        user = await User.findOne({ email })
        if (user) {
            user.idToken = idToken;
            await user.save({ validateBeforeSave: false });
        }
        else {
            if (!fullname || !avatar) {
                throw new ApiError(400, "Fullname and avatar is required");
            }
            user = await User.create({
                email,
                fullname,
                username: email.split("@")[0],
                avatar,
                idToken,
                password: "googlelogin"
            })
        }
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }
        return res.status(200).cookie("idToken", idToken, options).json(new ApiResponse(200, { user }, "User logged in successfully"))
    })
    registerUser = asyncHandler(async (req, res) => {
        const { username, email, password, fullname } = req.body;
        if (
            [username, email, password, fullname].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required");
        }
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existedUser) {
            throw new ApiError(400, "User already exists")
        }
        const user = await User.create({
            email,
            password,
            fullname,
            username: username.toLowerCase(),
            avatar: "https://shot-tube-videos.s3.ap-south-1.amazonaws.com/profile.png"
        })
        const createdUser = await User.findById(user._id)?.select("-password -refreshToken");
        if (!createdUser) {
            throw new ApiError(500, "Failed to create user");
        }
        return res.status(201).json(
            new ApiResponse(200, { createdUser }, "User created successfully")
        )
    })
    loginUser = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email) {
            throw new ApiError(400, "email is required")
        }
        if (!password) {
            throw new ApiError(400, "password is required")
        }
        const existedUser = await User.findOne({ email });
        if (!existedUser) {
            throw new ApiError(400, "invalid email")
        }
        const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "invalid password")
        }
        const accessToken = await existedUser.generateAccessToken();
        const refreshToken = await existedUser.generateRefreshToken();
        const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        };
        return res
            .cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
                loggedInUser,
                accessToken,
                refreshToken,
            }, "user logged in successfully"))
    })
    logoutUser = asyncHandler(async (req, res) => {
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        };
        return res.status(200).clearCookie("idToken", options).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, null, "User logged out successfully"))
    })

}
export default new AuthController();