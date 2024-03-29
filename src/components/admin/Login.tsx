import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase-config";
import MagicDiv from "../utilities/MagicDiv";
import { useNavigate } from "react-router-dom";
import GenericPage from "../utilities/GenericPage";
import { EmbeddedButton, RoundedContainer } from "../utilities/EmbeddedUI";
import { KeyPressCallback } from "../../utilities";

function Login() {
    const [buttonText, setButtonText] = useState("log in")
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const submit = async ()=>{
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/dashboard")
        } catch (error) {
            console.warn(error);
            setButtonText("try again")
        }
    }
    return (
        <GenericPage>
            <KeyPressCallback keyName={"Enter"} onDown={submit}/>
            <RoundedContainer className="w-full md:w-[32rem]">
                <MagicDiv className={"text-5xl font-black pt-8 px-8"} languageSpecificChildren={{"en": "member login", "zh": "會員登錄"}}/>
                {/* Login form */}
                <form className="flex flex-col gap-2 w-full px-8 py-8">
                    <input type="email" name="email" placeholder="email" value={email} onChange={(e)=>{
                        setEmail(e.target.value)
                    }} className="w-full rounded-2xl px-3 py-1 border bg-transparent"/>
                    <input type="password" name="password" placeholder="password" value={password} onChange={(e)=>{
                        setPassword(e.target.value)
                    }} className="w-full rounded-2xl px-3 py-1 border bg-transparent"/>
                </form>
                <EmbeddedButton position="bottom" className="h-12" onClick={submit}>{buttonText}</EmbeddedButton>
            </RoundedContainer>
        </GenericPage>
    );
}

export default Login;