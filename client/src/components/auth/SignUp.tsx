import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { signUpFormValidation } from "../ui/validation";
import { IoLogoYoutube } from "react-icons/io";
import authService from "@/services/auth.services";
import { IRegisterForm } from "@/interfaces";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import PasswordInput from "../root/PasswordInput";
import { toast } from "sonner";
const SignUp = () => {
    const navigate = useNavigate();
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
            await authService.register(values);
            toast.success("account created successfully");
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center mx-2 text-black">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full z-10">
                <div className="text-center mb-6">
                    <div className="flex justify-center space-x-1 items-center">
                        <IoLogoYoutube className="text-3xl" />
                        <div className="text-red-500 font-bold text-pretty">
                            ShotTube
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Sign Up
                    </h2>
                </div>
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
                                        <PasswordInput
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
                            className="w-full bg-blue-600 hover:bg-blue-700 px-32 text-white font-medium py-2 rounded-lg"
                        >
                            Sign up
                        </button>
                    </form>
                </Form>

                <div className="text-center text-sm mt-6">
                    <p>Already have an account?</p>
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
