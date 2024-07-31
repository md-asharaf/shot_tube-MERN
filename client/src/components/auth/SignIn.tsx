import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { signInFormValidation } from "../ui/validation";
import { useDispatch } from "react-redux";
import { login } from "@/provider";
import { useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { IoLogoYoutube } from "react-icons/io";
import authService from "@/services/auth.services";
import { ILoginForm } from "@/interfaces";
import { useToast } from "../ui/use-toast";

const SignIn = () => {
    const { toast } = useToast();
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const form = useForm<ILoginForm>({
        resolver: zodResolver(signInFormValidation),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit = async (values: ILoginForm) => {
        setError("");
        try {
            const res = await authService.login(values);
            if (!res) return;
            if (res.success) {
                toast({
                    title: "Login successfull",
                    description: "Welcome to ShotTube",
                });
                dispatch(login(res.data.user));
                navigate("/");
            } else {
                setError(res.message);
            }
        } catch (error: any) {
            console.log(error.message);
        }
    };

    return (
        <div className="w-[80%] sm:w-1/2 md:w-1/3 lg:w-1/4 items-center justify-center flex flex-col gap-2 dark:text-white text-black">
            <div className="flex space-x-4 items-center">
                <IoLogoYoutube className="text-3xl" />
                <div className="text-red-500 font-bold text-pretty">
                    ShotTube
                </div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <h1 className="font-semibold dark:text-zinc-200 text-zinc-800 text-sm border-b-[1px] pb-3 border-slate-500">
                    Sign in to your account
                </h1>
            </div>
            {error && <div className="text-red-500 font-semibold">{error}</div>}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 w-full px-4"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="enter username or email address"
                                        {...field}
                                        required
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="enter password"
                                        {...field}
                                        required
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <button
                        type="submit"
                        className="w-full rounded-full p-2 dark:bg-white bg-black text-white dark:text-black"
                    >
                        Sign in
                    </button>
                </form>
            </Form>
            <div className="flex gap-2 ">
                <p className="tracking-wider">do not have any account?</p>
                <Link
                    to="/register"
                    className="hover:underline font-sans text-blue-500"
                >
                    Sign up
                </Link>
            </div>
        </div>
    );
};

export default SignIn;
