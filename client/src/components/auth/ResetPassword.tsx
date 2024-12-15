import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import {  useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userServices from "@/services/user.services";
import { Label } from "../ui/label";
import PasswordInput from "../root/PasswordInput";

const ResetPassword = () => {
    const navigate = useNavigate();
    const { resetToken } = useParams();
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await userServices.resetPassword(resetToken, password);
            if (res.success) {
                navigate("/login");
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };
    return (
            <Card className="max-w-md p-6 bg-white text-black">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-center">
                        Reset Your Password
                    </h2>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {message && (
                            <p className="text-center text-red-500">
                                {message}
                            </p>
                        )}

                        <div>
                            <Label
                                htmlFor="password"
                                className="text-sm font-medium text-gray-700"
                            >
                                New Password
                            </Label>
                            <PasswordInput
                                id="password"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                                placeholder="Enter your new password"
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium text-gray-700"
                            >
                                Confirm Password
                            </Label>
                            <PasswordInput
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                                placeholder="Confirm your new password"
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-center text-sm text-gray-500">
                        Don't remember the reset link? Please check your email
                        again.
                    </p>
                </CardFooter>
            </Card>
    );
};

export default ResetPassword;
