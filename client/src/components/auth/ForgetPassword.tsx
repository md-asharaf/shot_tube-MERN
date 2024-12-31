import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import userServices from "@/services/user.services";
import authServices from "@/services/auth.services";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ForgotPassword = () => {
    const [searchText, setSearchText] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchLoading(true);
        setMessage("");
        setUsers([]);
        setSelectedUserId(null);
        try {
            const data = await userServices.getUsersBySearchText(searchText);
            setUsers(data.users);
        } catch (error) {
            setMessage(error);
            console.error(error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleResetRequest = async () => {
        setMessage("");
        setLoading(true);
        try {
            const selectedUser = users.find(
                (user) => user._id === selectedUserId
            );
            if (!selectedUser) throw new Error("No user selected");
            await authServices.sendResetLinkOnEmail(
                selectedUser.email
            );
            setMessage("Password reset link sent to your email");
        } catch (error) {
            setMessage(error);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md p-6 bg-white text-black mx-2">
            <CardHeader>
                <h2 className="text-xl font-semibold text-center">
                    Forgot Password
                </h2>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="searchText"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Enter your username or email:
                        </label>
                        <input
                            type="text"
                            id="searchText"
                            value={searchText}
                            onChange={handleSearchChange}
                            required
                            placeholder="Username or Email"
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={searchLoading}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {searchLoading ? "Searching..." : "Search"}
                    </button>
                </form>

                {users.length > 0 && (
                    <RadioGroup
                        value={selectedUserId}
                        onValueChange={(value) => setSelectedUserId(value)}
                        className="mt-4"
                    >
                        {users.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center justify-between border space-x-3 p-1 pr-4 rounded-lg hover:bg-gray-400"
                            >
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.username || "User Avatar"}
                                        />
                                        <AvatarFallback className="bg-orange-300">
                                            {user.fullname[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="cursor-pointer text-blue-600 hover:text-blue-800">
                                        {user.fullname}
                                    </span>
                                </div>
                                <RadioGroupItem
                                    value={user._id}
                                    id={`user-${user._id}`}
                                />
                            </div>
                        ))}
                    </RadioGroup>
                )}

                {selectedUserId && (
                    <button
                        onClick={handleResetRequest}
                        disabled={loading}
                        className="w-full py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {loading
                            ? "Sending Reset Request..."
                            : "Request Password Reset"}
                    </button>
                )}
            </CardContent>
            <CardFooter>
                {message && (
                    <p className="text-center text-sm text-gray-500">
                        {message}
                    </p>
                )}
            </CardFooter>
        </Card>
    );
};

export default ForgotPassword;
