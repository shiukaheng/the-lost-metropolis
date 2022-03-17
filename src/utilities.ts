import { useState, useEffect, useRef, useLayoutEffect, useContext, useCallback } from "react"
import { AuthContext } from "./components/admin/AuthProvider";
import { languages, SettingsContext, ThemeContext, ThemeContextType } from "./components/App";
import { ContentContext } from "./components/providers/ContentProvider";
import { cloneDeep, isEqual } from "lodash"
import { useFrame } from "@react-three/fiber";
import { Post, postSchema } from "../api/types/Post";
import VaporAPI from "./api_client/api";
import { uninstance, instance } from "../api/utilities";
import { PostDocData } from "../api/implementation_types/PostDocData";
import { Roled } from "../api/implementation_types/Role";
import { MultiLangString } from "../api/types/MultiLangString";

export function formatRGBCSS(color: number[]): string {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

export function useKeyPress(targetKey: string) {
    const [pressed, setPressed] = useState(false);
    useOnLoseFocus(()=>{
        setPressed(false);
    })
    const onDownRef = useRef(() => {
        setPressed(true)
    })
    const onUpRef = useRef(() => {
        setPressed(false)
    })
    if (targetKey.length === 1 && targetKey.toLowerCase() === targetKey) {
        useAsyncKeyPress(targetKey.toLowerCase(), onDownRef, onUpRef)
        useAsyncKeyPress(targetKey.toUpperCase(), onDownRef, onUpRef)
    } else {
        useAsyncKeyPress(targetKey, onDownRef, onUpRef)
    }
    return pressed;
}

export const useOnLoseFocus = (onLoseFocus: () => void) => {
    const onFocus = useCallback(() => {
        onLoseFocus()
    }, [onLoseFocus])
    useEffect(() => {
        window.addEventListener("blur", onFocus)
        return () => {
            window.removeEventListener("blur", onFocus)
        }
    }, [onFocus])
}

export function useRefState(initialValue) {
    const [value, setValue] = useState(initialValue);
    const ref = useRef(initialValue);
    useEffect(()=>{
        ref.current = value;
    }, value)
    return [ref, value, setValue]
}

export function useAsyncKeyPress(targetKey, onKeyDownRef={current:()=>{}}, onKeyUpRef={current: ()=>{}}) {
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

export function useAsyncReference(value) {
    const ref = useRef(value);
    const [, forceRender] = useState(false);
  
    const updateState = (newState) => {
        ref.current = newState;
        forceRender(s => !s);
    }
  
    return [ref, updateState];
}

export function KeyPressCallback({keyName, onDown=()=>{}, onUp=()=>{}}) {
    const onDownRef = useRef(onDown)
    const onUpRef = useRef(onUp)
    useEffect(()=>{
        onDownRef.current = onDown
        onUpRef.current = onUp
    }, [onDown, onUp])
    useAsyncKeyPress(keyName, onDownRef, onUpRef)
    return (null)
}

// Linear color to sRGB color conversion (From Github Copilot ??!)
export function SRGBToLinear( c_arr ) {
	return c_arr.map((c)=>(( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 )));

}

export function LinearToSRGB( c_arr ) {
	return c_arr.map((c)=>(( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055));

}

export function useStickyState(defaultValue, key) {
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

export function useFollowMouse(onMouseMove:Function|null=null) {
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
        if (body === null) {
            return ()=>{}
        }
        body.addEventListener("mousemove", mouseMoveHandler)
        return () => {
            body.removeEventListener("mousemove", mouseMoveHandler)
        }
    }, [])
    return mousePosRef
}

// /**
//  * Hook that provides a list of documents given a provider
//  * @param provider - Any subscription provider
//  * @param requriesAuth - If enabled, it does not query the provider if the user is not logged in 
//  * @param cachingKey - If not null, it will cache the result in localStorage with the given key
//  * @returns An array of posts or null if it's not loaded
//  */
// export function useSubscription(provider:SubscriptionProvider, requriesAuth=false, cachingKey:null|string=null):Post[]|null {
//     const {currentUser} = useContext(AuthContext)
//     const [posts, setPosts] = (cachingKey === null ? useState(null) : useStickyState(null, cachingKey))
//     const unsubRef = useRef(null);
//     useEffect(() => {
//         if (unsubRef.current) {
//             unsubRef.current()
//         }
//         if (currentUser || !requriesAuth) {
//             unsubRef.current = provider(setPosts);
//             // console.log("Subscribed to updates")
//         } else {
//             // console.log("Not subscribed to updates because not logged in")
//             setPosts([]) // Returning an empty array instead of null because its that user does not have permission, not that we cant load posts
//         }
//         return () => {
//             if (unsubRef.current) {
//                 unsubRef.current();
//             }
//         };
//     }, [currentUser]);
//     return posts;
// }

export const useMultilang = (content?: MultiLangString) => {
    const {settings} = useContext(SettingsContext)
    if (content === undefined || content === null) {
        return ""
    }
    return content[settings.lang]
}

/**
 * Hook that provides a post and a method to update it given an id and properties you want to update
 */
export function usePost(id: string | null, whitelist?: (keyof Post)[], blacklist?: (keyof Post)[]): [Post | null, ((newPost:Partial<Post>)=>Promise<void>) | null] {
    // Returns post and setter, setter returns null if no edit permission
    const posts = useContext(ContentContext)
    if (posts === null) {
        return [null, null]
    }
    if (id === null) {
        return [null, null]
    }
    const post = posts.find((p) => p.id === id)?.data || null
    const setPost = async (newPost: Partial<Post>) => {               
        // await updatePost(id, newPost)
        await VaporAPI.updatePost(
            instance(newPost, id),
            whitelist,
            blacklist
        )
    }
    return [post, post === null ? null : setPost]
}

export function filterProps(target:Partial<Post>, props:(keyof Post)[]=[]):Partial<Post> {
    const filtered = {}
    props.forEach((prop) => {
        if (target[prop] !== undefined) {
            filtered[prop] = target[prop]
        } else {
            console.warn(`${prop} is not defined`)
        }
    })
    return filtered
}

/**
 * Logic for updating posts in an editor
 * @param id the id of the post to update
 * @param props which props on the post document to modify
 * @param onBufferChange a function that is called when the buffer (used for user input) changes
 * @param onPull callback for when user pulls new post from server
 * @param onPush callback when user pushes post to server
 */
export function useBufferedPost (
    id, 
    props:(keyof PostDocData)[]=[], 
    onBufferChange=(buffer: Partial<Post>)=>{}, 
    onPull=(buffer: Partial<Post>)=>{}, 
    onPush=(buffer: Partial<Post>)=>{}):
    [Partial<Post>, (post: Partial<Post>)=>void, Partial<Post>, ()=>Promise<void>, ()=>void, boolean, boolean]
    {
    const [post, setPost] = usePost(id)
    if (post === null) {
        throw new Error("Post not found in useBufferedPost")
    }
    const filteredPost = filterProps(post, props)
    const [buffer, _setBuffer] = useState(filteredPost)
    // Tracking changes to buffer / post
    const initialBufferRef = useRef(filteredPost)
    const postTriggersRef = useRef(0)
    const postChangesRef = useRef<Post|null>(null)
    const setBuffer = (newBuffer: Partial<Post>) => {
        // Inject
        _setBuffer(filterProps(newBuffer, props))
        onBufferChange(newBuffer)
    }
    const [overwriteWarning, setOverwriteWarning] = useState(false)
    useEffect(()=>{
        if (postTriggersRef.current > 0) {
            // console.log("post updated")
            if (!isEqual(post, postChangesRef.current)) {
                // console.log("post changed")
                if (!isEqual(buffer, filterProps(post, props))) {
                    setOverwriteWarning(true)
                }
                postChangesRef.current = post
            }
        } else {
            // Post initial update
            postChangesRef.current = post
        }
        postTriggersRef.current++
    }, [post])
    // To determine changed: If buffer is different than initially fetched
    // To determine overwriteWarning: If initial buffer is older than post, warn user that they may overwrite data if they push
    const push = async () => {
        initialBufferRef.current = buffer
        if (setPost === null) {
            throw new Error("Post not found in useBufferedPost")
        }
        if (buffer === null) {
            throw new Error("Buffer is somehow not initialized")
        }
        await setPost(buffer)
        setOverwriteWarning(false)
        onPush(buffer)
    }
    const pull = () => {
        console.log("pulled")
        setBuffer(filteredPost)
        initialBufferRef.current = filteredPost
        setOverwriteWarning(false)
        onBufferChange(filteredPost)
        onPull(filteredPost)
    }
    // console.log(bufferChanged, postChanged)
    // Change describes mismatch between buffer and post, OverwriteWarning indicates database has newer version than buffer
    const changed = !isEqual(buffer, initialBufferRef.current)
    return [buffer, setBuffer, post, push, pull, changed, (overwriteWarning && post !== undefined)]
}
type GenericCallback = ((...args:any[]) => void) | ((...args:any[]) => Promise<void>)
export const useConfirm = (defaultText="default", confirmText="confirm", pendingText="pending", onConfirm:GenericCallback=()=>{}, onTimeout=()=>{}) => {
    const [deleteState, setDeleteState] = useState(0) // 0: not deleted, 1: confirm (otherwise countdown), 2: requested
    const [countdown, setCountdown] = useState(3)
    const countdownRef = useRef<number|null>(null)
    const [intervalCb, setIntervalCb] = useState<null|ReturnType<typeof setInterval>>(null)
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
                setDeleteState(2);
                (onConfirm() as Promise<any>).then(() => {
                    setDeleteState(0);
                    setCountdown(3);
                })
            } else if (onConfirm.constructor.name === "Function") {
                onConfirm();
                setDeleteState(0);
                setCountdown(3);
            }
            if (intervalCb) {
                clearInterval(intervalCb);
            }
        }
    }
    const text = deleteState === 0 ? defaultText : deleteState === 1 ? `${confirmText} (${countdown})` : pendingText
    return [text, trigger]
}

export const createEmptyMultilangString = () => {
    // Transform languages array to an object with each language as key and empty string as value; languages is already imported
    return languages.reduce((obj, lang) => {
        obj[lang] = ""
        return obj
    }, {})
}

export const useTheme = (targetTheme) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const originalThemeRef = useRef(theme)
    useEffect(()=>{
        originalThemeRef.current = theme
        setTheme(targetTheme)
        return (
            () => {
                setTheme(originalThemeRef.current)
            }
        )
    }, [])
}

export function Condition({condition, children}) {
    return condition ? children : null
}

export function useChooseFile(): [()=>void, File | null] {
    // Returns createPrompt function and file object
    const [file, setFile] = useState<File|null>(null)
    // Create an input DOM object that will be used to trigger the file upload prompt
    const inputRef = useRef<HTMLInputElement|null>(null)
    useEffect(()=>{
        inputRef.current = document.createElement("input")
        inputRef.current.type = "file"
        inputRef.current.style.display = "none"
        inputRef.current.addEventListener("change", (e) => {
            if (e.target === null) {
                return
            }
            const files = (e.target as HTMLInputElement).files
            if (files !== null && files.length > 0) {
                setFile(files[0])
            }
        })
    }, [])
    const createPrompt = () => {
        inputRef.current && inputRef.current.click()
    }
    return [createPrompt, file]
}