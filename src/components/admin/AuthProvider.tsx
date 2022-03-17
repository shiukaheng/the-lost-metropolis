import { createContext, useEffect, useState } from "react";
import { auth } from "../../firebase-config"
import { onAuthStateChanged, User } from "firebase/auth"
// import { useStickyState } from "../../utilities";

type AuthContextValue = {
    currentUser: User | null;
}

export const AuthContext = createContext<AuthContextValue>({
    currentUser: null
});

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User|null>(null);
    const [pending, setPending] = useState<boolean>(true);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
            setPending(false)
        });
    }, []);

    if(pending){
       return <>Loading...</>
    }

    return (
        <AuthContext.Provider
            value={{
                currentUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};