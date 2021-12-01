export default function AppContainer(props) {
    return (
        <div className="flex flex-col m-8">
            {props.children}
        </div>
    )
}