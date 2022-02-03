import MagicDiv from "../MagicDiv";

function EditorButton({text="Button", onClick=()=>{}, className=""}) {
    return (
        <MagicDiv mergeTransitions className={`editor-secondary-button ${className}`} onClick={onClick}>{text}</MagicDiv>
    );
}

export default EditorButton;