import { Suspense, ReactNode } from "react"

type CompositeSuspenseProps = {
    children: ReactNode
}

function CompositeSuspense({children}:CompositeSuspenseProps) {
    return (
        <Suspense fallback={null}>
            {children}
        </Suspense>
    );
}

export default CompositeSuspense;