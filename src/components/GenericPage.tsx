import MagicDiv from "./MagicDiv";

function GenericPage({className, style, ...props}) {
    return (
        <div className="w-full h-full relative overflow-auto page-margins">
            <MagicDiv {...{className, style}}>
                {props.children}
            </MagicDiv>
        </div>
    );
}

export default GenericPage;