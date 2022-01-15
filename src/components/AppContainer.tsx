export default function AppContainer(props) {
    return (
        <div className="flex flex-col md:flex-row flex-nowrap h-full w-full absolute overflow-hidden">
            {props.children}
        </div>
    )
}