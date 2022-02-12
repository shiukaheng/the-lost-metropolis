export default function AppContainer({ children }) {
    return (
        <div className="flex flex-col md:flex-row flex-nowrap h-full w-full absolute overflow-hidden">
            {children}
        </div>
    )
}