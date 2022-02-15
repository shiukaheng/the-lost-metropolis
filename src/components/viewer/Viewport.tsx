import { Canvas } from "@react-three/fiber"
import { PotreeManager } from "../3d/managers/PotreeManager"
import ViewportCanvas from "./ViewportCanvas"
import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import MagicDiv from "../utilities/MagicDiv";

type ViewportProps = {
    children?: ReactNode
}

function Fallback({error, resetErrorBoundary}) {
    return (
        <div className="p-8 flex flex-col gap-2">
          <div className="font-bold text-3xl">Something went wrong.</div>
          <p>{error}</p>
          <MagicDiv className="editor-secondary-button text-center w-40" onClick={resetErrorBoundary}>Try again</MagicDiv>
        </div>
    )
}

function Viewport({children, ...props}:ViewportProps) {
    return (
        <div {...props}>
            <ErrorBoundary FallbackComponent={Fallback}>
                <ViewportCanvas className="w-full h-full">
                    {children}
                </ViewportCanvas>
            </ErrorBoundary>
        </div>
    );
}

export default Viewport;