export default function AppContainer(props) {
    return (
        <div className="m-20 flex flex-row flex-nowrap">
            {props.children}
        </div>
    )
}