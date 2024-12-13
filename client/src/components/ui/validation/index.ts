import { z } from "zod";

export const signUpFormValidation = z
    .object({
        username: z.string().min(2, "Username must be at least 2 characters"),
        fullname: z.string().min(2, "Full name must be at least 2 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        email: z.string().email("Invalid email address"),
    })
    .required();

export const signInFormValidation = z
    .object({
        email: z.string().min(2, "Email must be at least 2 characters"),
        password: z
            .string()
            .min(8, { message: "Password is too short" })
            .max(20, { message: "Password is too long" }),
    })
    .required();

    export const VideoFormValidation = z.object({
        title: z.string().nonempty("Title is required"),
        description: z.string().nonempty("Description is required"),
        video: z
            .instanceof(File, { message: "Please provide a valid video file" })
            .refine(file => file.type.startsWith("video/"), {
                message: "Only video files are allowed",
            }),
        thumbnail: z
            .instanceof(File, { message: "Please provide a valid thumbnail" })
            .refine(file => file.type.startsWith("image/"), {
                message: "Only image files are allowed",
            }),
    }).required()
