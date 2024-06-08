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

export const VideoFormValidation = z
    .object({
        title: z.string().min(2, "Title must be at least 2 characters"),
        description: z
            .string()
            .min(2, "Description must be at least 2 characters"),
        video: z
            .instanceof(FileList)
            .refine((file) => file?.length == 1, "File is required."),
        thumbnail: z
            .instanceof(FileList)
            .refine((file) => file?.length == 1, "File is required."),
    })
    .required();
