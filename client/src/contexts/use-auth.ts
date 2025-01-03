import { useEffect, useState } from "react";
import User from "@/services/User";
export default function useAuth(){
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await User.getCurrentUser();
                setUser(data.user);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    }, []);
    return { user };
}