import { Suspense } from "react"

function CompositeSuspense({children}) {
    return (
        <Suspense fallback={null}>
            {children}
        </Suspense>
    );
}

export default CompositeSuspense;