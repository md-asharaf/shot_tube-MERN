import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import userServices from "@/services/user.services";
import authServices from "@/services/auth.services";

const ForgotPassword = () => {
    const [searchText, setSearchText] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setUsers([]);
        setSelectedUser(null);
        try {
            const res = await userServices.getUsersBySearchText(searchText);
            if (res.success) setUsers(res.data);
        } catch (error) {
            setMessage(error.message);
            console.error("Error while searching for users", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const handleResetRequest = async () => {
        setMessage("");
        setLoading(true);
        try {
            const res = await authServices.sendResetLinkOnEmail(
                selectedUser.email
            );
            if (res.success) {
                setMessage(res.message);
            }
        } catch (error) {
            setMessage(error.message);
            console.error(
                "Error while requesting for reset password link",
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md p-6 bg-white text-black">
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
                            Enter username or email to search:
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
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>

                <ul className="mt-2 space-y-2">
                    {users.map((user) => (
                        <li
                            key={user._id}
                            className="flex items-center justify-between space-x-3 p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <div className="flex space-x-4 items-center">
                                <img
                                    src={user.avatar}
                                    alt={user.username || "User Avatar"}
                                    className="w-8 h-8 rounded-full object-cover"
                                />

                                <span className="cursor-pointer text-blue-600 hover:text-blue-800">
                                    {user.fullname}
                                </span>
                            </div>
                            <input
                                type="radio"
                                name="selectedUser"
                                value={user._id}
                                onChange={() => handleUserSelect(user)}
                                checked={selectedUser?._id === user._id}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 rounded-full"
                            />
                        </li>
                    ))}
                </ul>
                {selectedUser && (
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
