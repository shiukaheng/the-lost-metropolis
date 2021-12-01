export default function AppContainer(props) {
    return (
        // <div className="m-20 flex flex-row flex-nowrap"> DESKTOP
        <div className="p-8 md:p-20 flex flex-col md:flex-row flex-nowrap h-full w-full absolute overflow-hidden">
            {props.children}
        </div>
    )
}