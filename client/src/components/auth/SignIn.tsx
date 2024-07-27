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
import { toast, useToast } from "../ui/use-toast";

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
        <div className="items-center justify-center flex flex-col gap-2 text-white">
            <div className="flex space-x-4 items-center">
                <IoLogoYoutube className="text-3xl" />
                <div className="text-red-500 font-bold text-pretty">
                    ShotTube
                </div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <h1 className="font-semibold text-zinc-300 text-sm border-b-[1px] pb-3 border-slate-500">
                    Sign in to your account
                </h1>
            </div>
            {error && <div className="text-red-500 font-semibold">{error}</div>}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 w-1/2"
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
                    <Button
                        variant="secondary"
                        type="submit"
                        className="w-full"
                    >
                        Sign in
                    </Button>
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
