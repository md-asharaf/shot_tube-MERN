import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { signInFormValidation } from "../ui/validation";
import { useDispatch } from "react-redux";
import { login } from "@/provider";
import { useState } from "react";
import { loginWithGoogle } from "@/services/firebase.services";
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
    const googleSignIn = async () => {
        try {
            const userGoogleData = await loginWithGoogle();
            const res = await authService.googleLogin(userGoogleData);
            if(res.success){
                toast({
                    title: "Login successfull",
                    description: "Welcome to ShotTube",
                });
                dispatch(login(res.data.user));
                navigate("/");
            }
        } catch (error) {
            console.log(error);
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
                        Sign In
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                        >
                            Sign In
                        </button>
                    </form>
                </Form>

                <div className="mt-6">
                    <button
                        className="w-80 flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 py-1 px-6 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="google-signin-btn"
                        onClick={googleSignIn}
                    >
                        <img
                            src="https://cdn-teams-slug.flaticon.com/google.jpg"
                            alt="Google Icon"
                            className="w-8 h-8 mr-3"
                        />
                        <span className="text-lg">Sign in with Google</span>
                    </button>
                </div>

                <div className="text-center text-sm mt-6">
                    <p>Don't have an account?</p>
                    <Link
                        to="/register"
                        className="text-blue-500 hover:underline"
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
