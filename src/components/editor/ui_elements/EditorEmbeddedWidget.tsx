import { ForwardRefRenderFunction, ReactNode, forwardRef } from 'react';
import { useStickyState } from "../../../utilities"

interface EditorEmbeddedWidgetProps {
    title?: string;
    children: ReactNode;
    stickyKey: string;
    defaultExpanded?: boolean;
}

const EditorEmbeddedWidget: ForwardRefRenderFunction<HTMLDivElement, EditorEmbeddedWidgetProps> = 
({ title = "Title", children, stickyKey, defaultExpanded = true }, ref) => {
    const [expanded, setExpanded] = useStickyState(defaultExpanded, stickyKey);
    
    return (
        <div className="editor-embedded-widget" ref={ref}>
            <div className="flex flex-row">
                <div className="text-current text-md font-bold">{title}</div>
                <div className="text-current text-xl font-bold ml-auto select-none cursor-pointer" onClick={() => {setExpanded(!expanded)}}>{expanded ? "-" : "+"}</div>
            </div>
            <div className="flex flex-col gap-2">
                {expanded ? children : null}
            </div>
        </div>
    )
}

export default forwardRef(EditorEmbeddedWidget);
