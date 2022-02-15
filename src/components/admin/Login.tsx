import { useCallback, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase-config";
import MagicDiv from "../utilities/MagicDiv";
import { Fade } from "react-reveal";
import { useNavigate } from "react-router-dom";
import GenericPage from "../utilities/GenericPage";
import MagicButton from "../utilities/MagicButton";

function Login() {
    const [buttonText, setButtonText] = useState("log in")
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    return (
        <GenericPage className="flex flex-col gap-8 border rounded-3xl p-8 overflow-clip w-[20rem]">
            <Fade top cascade>
                <MagicDiv className={"text-5xl font-black"} languageSpecificChildren={{"en": "member login", "zh": "會員登錄"}}/>
            </Fade>
            {/* Login form */}
            <form className="flex flex-col gap-2 w-full">
                <input type="email" name="email" placeholder="email" value={email} onChange={(e)=>{
                    setEmail(e.target.value)
                }} className="w-full rounded-2xl px-3 py-1 border bg-transparent"/>
                <input type="password" name="password" placeholder="password" value={password} onChange={(e)=>{
                    setPassword(e.target.value)
                }} className="w-full rounded-2xl px-3 py-1 border bg-transparent"/>
                <MagicButton solid onClick={
                    async ()=>{
                        try {
                            await signInWithEmailAndPassword(auth, email, password);
                            navigate("/dashboard")
                        } catch (error) {
                            console.warn(error);
                            setButtonText("try again")
                        }
                    }
                }>{buttonText}</MagicButton>
            </form>
        </GenericPage>
    );
}

export default Login;