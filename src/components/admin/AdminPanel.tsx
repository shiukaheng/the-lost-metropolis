import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MagicDiv from "../MagicDiv";
import { AuthContext } from "./AuthProvider";

function AdminPanel() {
    const {currentUser} = useContext(AuthContext)
    const navigate = useNavigate()
    useEffect(()=>{
        console.log(currentUser)
        if (currentUser === null) {
            navigate("/login")
        }
    }, [])
    return (
        <MagicDiv className="primary-button">Create post</MagicDiv>
    );
}

export default AdminPanel;