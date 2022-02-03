import { Canvas, useThree } from "@react-three/fiber"
import DebugPlane from "./3d/DebugPlane";
import ViewportCanvas from "./ViewportCanvas"
import { OrbitControls } from '@react-three/drei'
import { ErrorBoundary } from "react-error-boundary";
import MagicDiv from "./MagicDiv";

function Fallback({error, resetErrorBoundary}) {
    return (
        <div className="p-8 flex flex-col gap-2">
          <div className="font-bold text-3xl">Something went wrong.</div>
          <p>{error}</p>
          <MagicDiv className="editor-secondary-button text-center w-40" onClick={resetErrorBoundary}>Try again</MagicDiv>
        </div>
      )
}

function DebugViewport({children, ...props}) {
    return (
        <div {...props}>
            <ErrorBoundary FallbackComponent={Fallback}>
                <ViewportCanvas> 
                    <OrbitControls enablePan enableRotate enableZoom makeDefault/>
                    {children}
                </ViewportCanvas>
            </ErrorBoundary>
        </div>
    );
}

export default DebugViewport;