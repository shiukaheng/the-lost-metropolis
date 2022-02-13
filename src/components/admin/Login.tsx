import { useCallback, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase-config";
import MagicDiv from "../utilities/MagicDiv";
import { Fade } from "react-reveal";
import { useNavigate } from "react-router-dom";
import GenericPage from "../utilities/GenericPage";

function Login() {
    const [buttonText, setButtonText] = useState("log in")
    const navigate = useNavigate()
    const handleLogin = useCallback(async event => {
        event.preventDefault();
        const { email, password } = event.target.elements;
        try {
            await signInWithEmailAndPassword(auth, email.value, password.value);
            navigate("/admin")
        } catch (error) {
            console.warn(error);
            setButtonText("try again")
        }
    }, [])
    return (
        <GenericPage className="flex flex-col gap-8">
            <Fade top cascade>
                <MagicDiv className={"text-5xl font-black"} languageSpecificChildren={{"en": "member login", "zh": "會員登錄"}}/>
            </Fade>
            {/* Login form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-2 w-[20rem]">
                <label>
                    <input type="email" name="email" placeholder="email" className="string-input-cell"/>
                </label>
                <label>
                    <input type="password" name="password" placeholder="password" className="string-input-cell"/>
                </label>
                <button type="submit" className="secondary-button">{buttonText}</button>   
            </form>
        </GenericPage>
    );
}

export default Login;