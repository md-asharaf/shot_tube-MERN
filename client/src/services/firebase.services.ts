import { initializeApp } from "firebase/app";
import {
    getAdditionalUserInfo,
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import s3Services from "./s3.services";
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account",
});
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const { isNewUser } = getAdditionalUserInfo(result);
        const user = result.user;
        const email = user.email;
        const idToken = await user.getIdToken();
        if (isNewUser) {
            console.log("New user");
            // Add the user to the database
            const fullname = user.displayName;
            const avatar = await s3Services.downloadImageAndUploadToS3(
                user.photoURL,
                `${user.uid}.jpg`
            );
            return { fullname, idToken, email, avatar };
        } else {
            //login the user
            return { email, idToken };
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
};

export const logoutFromGoogle = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error during logout:", error);
    }
};
