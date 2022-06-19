import { formatRGBCSS } from "../../utilities"
import { Theme } from "../App"

function updateChildren(sceneChildren, childrenToUpdate) {
    // return new sceneChildren but with the children whose props.id is in updateChildren
    const idsToBeUpdated = childrenToUpdate.map(child => child.props.objectID)
    return sceneChildren.map(child => {
        if (idsToBeUpdated.includes(child.props.objectID)) {
            return childrenToUpdate.find(item => item.props.objectID === child.props.objectID)
        } else {
            return child
        }
    })
}

function joinChildren(...sceneChildrens) {
    // Returns a new array of sceneChildren but with a union of all children. We identify children by props.id. Later lists have higher priority.
    return sceneChildrens.reduce((acc: any[], curr) => {
        // console.log(acc, curr)
        // For each child in curr, if it is not in acc, add it, otherwise, replace it.
        curr.forEach(child => {
            const index = acc.findIndex(item => item.props.objectID === child.props.objectID)
            if (index === -1) {
                acc.push(child)
            } else {
                acc[index] = child
            }
        })
        return acc
    }, [])
}

function wrapOnClick(onClick:(e)=>void, context, id) {
    return (event) => {
        if (context?.overrideInteractions) {
            if (context.shiftPressed) {
                if (context.selectedIDs.includes(id)) {
                    context.removeSelectedIDs([id])
                } else {
                    context.addSelectedIDs([id])
                }
            } else {
                context.setSelectedIDs([id])
            }
        } else {
            onClick(event)
        }
    }
}

// Behaviour for hover and blur is to ignore if overrideInteractions is true; id is passed just in case for future use
function wrapOnHover(onHover:(e)=>void, context, id) {
    return (event) => {
        if (!context?.overrideInteractions) {
            onHover(event)
        }
    }
}

function wrapOnBlur(onBlur:(e)=>void, context, id) {
    return (event) => {
        if (!context?.overrideInteractions) {
            onBlur(event)
        }
    }
}

export function createSelectStyles(theme: Theme) {
    return {
        option: (provided, state) => ({
            ...provided,
            fontSize: "15px",
            // backgroundColor: formatRGBCSS(theme.backgroundColor),
            color: formatRGBCSS(theme.backgroundColor)
        }),
        control: (provided, state) => ({
            // none of react-select's styles are passed to <Control />
            ...provided,
            borderRadius: "999px",
            backgroundColor: formatRGBCSS(theme.foregroundColor),
            color: formatRGBCSS(theme.foregroundColor),
            borderColor: formatRGBCSS(theme.foregroundColor),
        }),
        singleValue: (provided, state) => {
            const opacity = state.isDisabled ? 0.5 : 1;
            const transition = 'opacity 300ms';
            const color = formatRGBCSS(theme.backgroundColor);
            return { ...provided, opacity, transition, color };
        },
        menu: (provided, state) => ({
            ...provided,
            borderRadius: "20px",
            overflow: "clip",
            backgroundColor: formatRGBCSS(theme.foregroundColor),
            color: formatRGBCSS(theme.backgroundColor),
            borderColor: formatRGBCSS(theme.foregroundColor),
            borderWidth: "1px"
        })
    };
}

export { joinChildren, updateChildren, wrapOnClick, wrapOnHover, wrapOnBlur }