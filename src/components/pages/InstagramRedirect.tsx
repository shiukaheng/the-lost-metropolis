import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStickyState } from "../../utilities";

export function InstagramRedirect() {
    // If first visit, redirect to home. Otherwise, redirect to browse.
    const [isFirstVisit, setIsFirstVisit] = useStickyState(true, "isFirstVisit");
    const navigate = useNavigate();
    useEffect(() => {
        if (isFirstVisit) {
            navigate("/", { replace: true });
            setIsFirstVisit(false);
        } else {
            navigate("/browse", { replace: true });
        }
    }, [])
    return (
        null
    )
}