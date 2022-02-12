import { useCallback, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase-config";
import MagicDiv from "../MagicDiv";
import { Fade } from "react-reveal";
import { useNavigate } from "react-router-dom";

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
        <MagicDiv backgroundColorCSSProps={["backgroundColor"]} className=" absolute w-full h-full flex justify-center items-center">
            <Fade top>
                <div className="flex flex-col gap-4">
                    {/* Login form */}
                    <form onSubmit={handleLogin} className="flex flex-col gap-2">
                        <label>
                            <input type="email" name="email" placeholder="email" className="string-input-cell"/>
                        </label>
                        <label>
                            <input type="password" name="password" placeholder="password" className="string-input-cell"/>
                        </label>
                        <button type="submit" className="secondary-button">{buttonText}</button>   
                    </form>
                </div>
            </Fade>
        </MagicDiv>
    );
}

export default Login;