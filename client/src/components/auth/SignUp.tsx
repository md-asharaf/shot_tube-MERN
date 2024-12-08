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
            console.error(error.message);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full z-10">
                <div className="text-center mb-6">
                    <div className="flex justify-center space-x-1 items-center">
                        <IoLogoYoutube className="text-3xl" />
                        <div className="text-red-500 font-bold text-pretty">
                            ShotTube
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                        Sign Up
                    </h2>
                </div>

                {error && (
                    <div className="text-red-500 font-semibold">{error}</div>
                )}
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
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Fullname"
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
                                    <FormControl>
                                        <Input
                                            placeholder="Username"
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
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Email address"
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
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-28 rounded-lg"
                        >
                            Sign Up
                        </button>
                    </form>
                </Form>

                <div className="text-center text-sm mt-6">
                    <p>Already have an account?</p>
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
