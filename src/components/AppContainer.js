export default function AppContainer(props) {
    return (
        // <div className="m-20 flex flex-row flex-nowrap"> DESKTOP
        <div className="flex flex-col md:flex-row flex-nowrap h-full w-full absolute overflow-hidden">
            {/* p-8 md:p-20  */}
            {props.children}
        </div>
    )
}