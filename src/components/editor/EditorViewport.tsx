import { Canvas, useThree } from "@react-three/fiber"
import ViewportCanvas from "../viewer/ViewportCanvas"
import { OrbitControls } from '@react-three/drei'
import { ErrorBoundary } from "react-error-boundary";
import MagicDiv from "../utilities/MagicDiv";
import { EditorContext } from "./EditorContext";
import { useContext } from "react";
import DOMControls from "../utilities/controls/DOMControls";

function Fallback({error, resetErrorBoundary}) {
    return (
        <div className="p-8 flex flex-col gap-2">
          <div className="font-bold text-3xl">Something went wrong.</div>
          <p>{error}</p>
          <MagicDiv className="editor-secondary-button text-center w-40" onClick={resetErrorBoundary}>Try again</MagicDiv>
        </div>
      )
}

function EditorViewport({children, ...props}) {
    const {movementMode} = useContext(EditorContext)
    return (
        <div {...props}>
            <ErrorBoundary FallbackComponent={Fallback}>
                <ViewportCanvas> 
                    {
                        (movementMode==="orbit") && <OrbitControls enablePan enableRotate enableZoom makeDefault/>
                    }
                    {
                        (movementMode==="pointerlock") && <DOMControls/>
                    }
                    {children}
                </ViewportCanvas>
            </ErrorBoundary>
        </div>
    );
}

export default EditorViewport;