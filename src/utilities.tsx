import { useState, useEffect, useRef, useLayoutEffect, useContext, useCallback } from "react"
import { createPost, updatePost } from "./api";
import { AuthContext } from "./components/admin/AuthProvider";
import { languages, SettingsContext } from "./components/App";
import { ContentContext } from "./components/providers/ContentProvider";
import { cloneDeep, isEqual } from "lodash"

function formatRGBCSS(color: number[]): string {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function useKeyPress(targetKey) {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState<boolean>(false);
    // If pressed key is our target key then set to true
    function downHandler({ key }) {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    }
    // If released key is our target key then set to false
    const upHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    };
    // Add event listeners
    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
        }, []); // Empty array ensures that effect is only run on mount and unmount
    return keyPressed;
}

function useAsyncKeyPress(targetKey, onKeyDownRef, onKeyUpRef) {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState<boolean>(false);
    // If pressed key is our target key then set to true
    function downHandler({ key }) {
        if (key === targetKey) {
            setKeyPressed(true);
            onKeyDownRef.current();
        }
    }
    // If released key is our target key then set to false
    const upHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(false);
            onKeyUpRef.current();
        }
    };
    // Add event listeners
    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
        }, []); // Empty array ensures that effect is only run on mount and unmount
    return keyPressed;
}

function useAsyncReference(value) {
    const ref = useRef(value);
    const [, forceRender] = useState(false);
  
    const updateState = (newState) => {
        ref.current = newState;
        forceRender(s => !s);
    }
  
    return [ref, updateState];
}

function KeyPressCallback({keyName, onDown=()=>{}, onUp=()=>{}}) {
    const onDownRef = useRef(null)
    const onUpRef = useRef(null)
    useEffect(()=>{
        onDownRef.current = onDown
        onUpRef.current = onUp
    }, [onDown, onUp])
    useAsyncKeyPress(keyName, onDownRef, onUpRef)
    return (null)
}

// Linear color to sRGB color conversion (From Github Copilot ??!)
function SRGBToLinear( c_arr ) {
	return c_arr.map((c)=>(( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 )));

}

function LinearToSRGB( c_arr ) {
	return c_arr.map((c)=>(( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055));

}

function useStickyState(defaultValue, key) {
    const [value, setValue] = useState(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null
        ? JSON.parse(stickyValue)
        : defaultValue;
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
        // Todo: Warn when value has values which will be turned into strings
    }, [key, value]);
    return [value, setValue];
}

function useFollowMouse(onMouseMove=null) {
    const mousePosRef = useRef([0,0])
    useLayoutEffect(() => {
        const body = document.querySelector("body")
        const mouseMoveHandler = (e) => {
            mousePosRef.current[0] = (e.clientX/(window.innerWidth)-0.5)*2
            mousePosRef.current[1] = -(e.clientY/(window.innerHeight)-0.5)*2
            if (onMouseMove) {
                onMouseMove(mousePosRef.current)
            }
        }
        body.addEventListener("mousemove", mouseMoveHandler)
        return () => {
            body.removeEventListener("mousemove", mouseMoveHandler)
        }
    }, [])
    return mousePosRef
}

/**
 * Used to get data that is subscribed to changes
 * @param provider A function that subscribes a callback to updates
 * @returns void
 */
const useSubscription = (provider, isPrivate=false, cachingKey=null) => {
    const {currentUser} = useContext(AuthContext);
    const [posts, setPosts] = (cachingKey === null ? useState(null) : useStickyState(null, cachingKey))
    const unsubRef = useRef(null);
    useEffect(() => {
        if (!!unsubRef.current) {
            unsubRef.current
        }
        if (!!currentUser || !isPrivate) {
            unsubRef.current = provider(setPosts);
        }
        return () => {
            if (unsubRef.current) {
                unsubRef.current();
            }
        };
    }, [currentUser]);
    return posts;
}

const useMultilang = (content) => {
    const {settings} = useContext(SettingsContext)
    return content[settings.lang]
}

const usePost = (id) => {
    // Returns post and setter, setter returns null if no edit permission
    const {posts, editablePosts} = useContext(ContentContext)
    const postResult = posts.find((p) => p.id === id)
    const editablePostResult = editablePosts.find((p) => p.id === id)
    const post = postResult || editablePostResult
    const setPost = editablePostResult ? (newPost) => {               
        updatePost(id, newPost.title, newPost.description, newPost.content, newPost.viewers, newPost.editors, newPost.published)
    } : null
    return [post, setPost]
}

const useWriteCheck = (source, checkMask) => {
    const now = Date.now()
    const oldRef = useRef([now, checkMask(cloneDeep(source))])
    const newRef = useRef([now, checkMask(cloneDeep(source))])
    const [changed, setChanged] = useState(false)
    useEffect(() => {
        console.log(changed)
    }, [changed])
    useEffect(()=>{
        const check = checkMask(cloneDeep(source)) // Mask what to check for changes
        const newChanged = !isEqual(oldRef.current[1], check) // Check if changed from reference
        setChanged(newChanged)
        if (newChanged) { // If changed, update newSnap
            newRef.current = [Date.now(), check]
        }
    }, [source, checkMask])
    const sync = () => {
        oldRef.current = newRef.current
        setChanged(false)
    }
    return [changed, (changed ? newRef.current[0] : oldRef.current[0]), sync]
}

const usePushPullCompare = (int, ext) => {
    // Returns true if int is newer than ext or vice versa

}

const useBufferedPost = (id, updateMask=(x)=>{return x}) => {
    // Returns buffer, setBuffer (stores new post in buffer), post (the post in the database), push function (syncs database with buffer, returns null if no edit permission), pull function (syncs buffer with database), changed (if buffer deviates from post), and overwriteWarning (true if database has changed since buffer was last synced)
    const {posts, editablePosts} = useContext(ContentContext)
    const postResult = posts.find((p) => p.id === id)
    const editablePostResult = editablePosts.find((p) => p.id === id)
    const [updateCount, setUpdateCount] = useState(0)
    const post = postResult || editablePostResult
    const [buffer, _setBuffer] = useState(post)
    const setBuffer = (newBuffer) => {
        // Inject
        _setBuffer(newBuffer)
    }
    const [bufferChanged, bufferChangedTime, updateReference] = useWriteCheck(buffer, updateMask)
    useEffect(() => {
        if (!!post) {
            // Inject
            if (updateCount === 0) {
                setBuffer(post)
            }
        }
    }, [post])
    const push = editablePostResult ? async () => {
        await updatePost(id, buffer.title, buffer.description, buffer.data, buffer.viewers, buffer.editors, buffer.published)
        updateReference()
    } : null
    const pull = () => {
        setBuffer(post)
        updateReference()
    }
    return [buffer, setBuffer, post, push, pull, bufferChanged, false]
}

const useConfirm = (defaultText="default", confirmText="confirm", pendingText="pending", onConfirm=()=>{}, onTimeout=()=>{}) => {
    const [deleteState, setDeleteState] = useState(0) // 0: not deleted, 1: confirm (otherwise countdown), 2: requested
    const [countdown, setCountdown] = useState(3)
    const countdownRef = useRef(null)
    const [intervalCb, setIntervalCb] = useState(null)
    useEffect(()=>{
        countdownRef.current = countdown
    }, [countdown])
    // function to start countdown and another to cancel the countdown and set back to 3
    const startDeleteCountdown = useCallback(() => {
        setDeleteState(1)
        const interval = setInterval(() => {
            setCountdown((x) => x - 1)
            if (countdownRef.current === 0) {
                setDeleteState(0)
                setCountdown(3)
                onTimeout()
                clearInterval(interval)
            }
        }, 1000)
        setIntervalCb(interval)
    }, [countdown])
    const trigger = () => {
        if (deleteState === 0) {
            startDeleteCountdown()
        } else if (deleteState === 1) {
            if (onConfirm.constructor.name === "AsyncFunction") {
                setDeleteState(2)
                onConfirm().then(() => {
                    setDeleteState(0)
                    setCountdown(3)
                })
            } else if (onConfirm.constructor.name === "Function") {
                onConfirm()
                setDeleteState(0)
                setCountdown(3)
            }
            if (intervalCb) {
                clearInterval(intervalCb)
            }
        }
    }
    const text = deleteState === 0 ? defaultText : deleteState === 1 ? `${confirmText} (${countdown})` : pendingText
    return [text, trigger]
}

const createEmptyMultilangString = () => {
    // Transform languages array to an object with each language as key and empty string as value; languages is already imported
    return languages.reduce((obj, lang) => {
        obj[lang] = ""
        return obj
    }, {})
}

const createEmptyPost = () => {
    return createPost(createEmptyMultilangString(), createEmptyMultilangString(), "", [], [], false)
}

export { formatRGBCSS, useKeyPress, useAsyncKeyPress, useAsyncReference, KeyPressCallback, LinearToSRGB, SRGBToLinear, useStickyState, useFollowMouse, useSubscription, useMultilang, usePost, useBufferedPost, useConfirm, createEmptyPost, useWriteCheck };