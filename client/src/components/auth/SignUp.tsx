import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
        <div className="items-center justify-center flex flex-col gap-2 text-white">
            <div className="flex space-x-4 items-center">
                <IoLogoYoutube className="text-3xl" />
                <div className="text-red-500 font-bold text-pretty">
                    ShotTube
                </div>
            </div>
            <h1 className="font-semibold text-zinc-300 text-sm border-b-[1px] pb-3 border-slate-500">
                Sign up to create an account
            </h1>
            {error && <div className="text-red-500 font-semibold">{error}</div>}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 w-1/2"
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
                    <Button
                        type="submit"
                        variant="secondary"
                        className="w-full"
                    >
                        Sign up
                    </Button>
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
