import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { signUpFormValidation } from "../ui/validation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/provider";
import { IoLogoYoutube } from "react-icons/io";
import authService from "@/services/auth.services";
import { IRegisterForm } from "@/interfaces";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "../ui/use-toast";

const SignUp = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState<string>("");
    const form = useForm<IRegisterForm>({
        resolver: zodResolver(signUpFormValidation),
        defaultValues: {
            fullname: "",
            username: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: IRegisterForm) => {
        try {
            const res = await authService.register(values);
            if (!res) return;
            if (res.success) {
                toast({
                    title: "Registration successfull",
                    description: "now you can login",
                });
                const { email } = res.data;
                const loginRes = await authService.login({
                    email,
                    password: values.password,
                });
                if (!loginRes || !loginRes.success) return;
                dispatch(login(loginRes.data.user));
                navigate("/");
            } else {
                setError(res.message);
            }
        } catch (error) {
            console.log(error);
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
            <h1 className="font-semibold dark:text-zinc-200 text-zinc-800 text-sm border-b-[1px] pb-3 border-slate-500">
                Sign up to create an account
            </h1>
            {error && <div className="text-red-500 font-semibold">{error}</div>}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 w-full"
                >
                    <FormField
                        control={form.control}
                        name="fullname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fullname</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="enter full name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="enter username"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="enter email address"
                                        {...field}
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
                        Sign up
                    </button>
                    <div className="flex gap-2 items-center justify-center">
                        <p className="tracking-wider">
                            already have an account?
                        </p>
                        <Link
                            to="/login"
                            className="hover:underline font-sans text-blue-500"
                        >
                            Sign in
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default SignUp;
