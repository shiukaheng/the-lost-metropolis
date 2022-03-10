function joinChildren(sceneChildren, childrenToUpdate) {
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

export { joinChildren, wrapOnClick, wrapOnHover, wrapOnBlur }