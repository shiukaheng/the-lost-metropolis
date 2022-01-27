import { Interactive, InteractionsContext } from "@react-three/xr";
import { useContext, Fragment } from "react";

export default function OptionalInteractive({children, ...props}) {
    const { addInteraction, removeInteraction } = useContext(InteractionsContext)
    const interactionsSuported = (addInteraction===null) && (removeInteraction===null)
    return (
        interactionsSuported ? (<Interactive {...props}>{children}</Interactive>) : (<Fragment>{children}</Fragment>)
    )
}