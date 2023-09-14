import { useState, useEffect, useRef, useLayoutEffect, useContext, useCallback, Context, MutableRefObject, useMemo, RefObject } from "react"
// import { AuthContext } from "./components/admin/AuthProvider";
import { defaultTheme, languages, SettingsContext, ThemeContext, ThemeContextType } from "./components/App";
// import { ContentContext, hidePosts } from "./components/providers/ContentProvider";
import { cloneDeep, isEqual, mapValues } from "lodash"
import { useFrame } from "@react-three/fiber";
import { Post, postSchema } from "../api/types/Post";
// import VaporAPI from "./api_client/api";
import { uninstance, instance } from "../api/utilities";
import { PostDocData } from "../api/implementation_types/PostDocData";
import { Roled } from "../api/implementation_types/Role";
import { MultiLangString } from "../api/types/MultiLangString";
import { MultiLangObject } from "../api/types/MultiLangObject";
// import { auth } from "./firebase-config.js"
import { Theme } from "../api/types/Theme";
import { Instance } from "../api/utility_types";
import { Sponsor } from "../api/types/Sponsor";
import { Asset } from "../api/types/Asset";
import { MagicString } from "../api/types/MagicString";
import { EventDispatcher } from "three";
import { ViewerContext } from "./components/viewer/ViewerContext";
import { useMediaQuery } from "react-responsive";

export function formatRGBCSS(color: number[]): string {
	return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

export function useKeyPress(targetKey: string) {
	const [pressed, setPressed] = useState(false);
	useOnLoseFocus(() => {
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

export function useRefState<T>(initialValue: T): [MutableRefObject<T>, T, (value: T) => void] {
	const [value, setValue] = useState(initialValue);
	const ref = useRef(initialValue);
	useEffect(() => {
		ref.current = value;
	}, [value])
	return [ref, value, setValue]
}

export function useAsyncKeyPress(targetKey, onKeyDownRef = { current: () => { } }, onKeyUpRef = { current: () => { } }) {
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

export function KeyPressCallback({ keyName, onDown = () => { }, onUp = () => { }, domRef = null }:{
	keyName: string,
	onDown?: () => void,
	onUp?: () => void,
	domRef?: RefObject<HTMLElement> | null
}) {
	const onDownRef = useRef(onDown)
	const onUpRef = useRef(onUp)
	useEffect(() => {
		onDownRef.current = () => {
			// If activeElement is not body, then we skip: HACK?!
			if (document.activeElement !== document.body) {
				return
			}
			onDown()
		}
		onUpRef.current = () => {
			if (document.activeElement !== document.body) {
				return
			}
			onUp()
		}
	}, [onDown, onUp])
	useAsyncKeyPress(keyName, onDownRef, onUpRef)
	return (null)
}

// Linear color to sRGB color conversion (From Github Copilot ??!)
export function SRGBToLinear(c_arr) {
	return c_arr.map((c) => ((c < 0.04045) ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4)));

}

export function LinearToSRGB(c_arr) {
	return c_arr.map((c) => ((c < 0.0031308) ? c * 12.92 : 1.055 * (Math.pow(c, 0.41666)) - 0.055));

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

export function useFollowMouse(onMouseMove: Function | null = null) {
	const mousePosRef = useRef([0, 0])
	useLayoutEffect(() => {
		const body = document.querySelector("body")
		const mouseMoveHandler = (e) => {
			mousePosRef.current[0] = (e.clientX / (window.innerWidth) - 0.5) * 2
			mousePosRef.current[1] = -(e.clientY / (window.innerHeight) - 0.5) * 2
			if (onMouseMove) {
				onMouseMove(mousePosRef.current)
			}
		}
		if (body === null) {
			return () => { }
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

export const useMultiLang = (content: MultiLangString) => {
	const { settings } = useContext(SettingsContext)
	if (content === undefined || content === null) {
		return ""
	}
	return content[settings.lang]
}

export function useMultiLangObject(content: MultiLangObject): { [key: string]: string } {
	const { settings } = useContext(SettingsContext)
	if (content === undefined || content === null) {
		return {}
	}
	return mapValues(content, (value) => value[settings.lang])
}
export function usePost(
	id: string | null,
	autoCreate: boolean = true,
	whitelist?: (keyof Post)[],
	blacklist?: (keyof Post)[]
): [Post | null, ((newPost: Partial<Post>) => Promise<void>) | null] {
	const [post, setPost] = useState<Post | null>(null);

	useEffect(() => {
		if (id === null) {
			setPost(null);
			return;
		}

		const storedPost = localStorage.getItem(id);
		if (storedPost) {
			console.log("Loaded post from localStorage", id, JSON.parse(storedPost))
			setPost(JSON.parse(storedPost));
		} else if (autoCreate) {
			// Create an empty post
			console.log("Created new post", id)
			const defaultPost = postSchema.getDefault() as Post;
			localStorage.setItem(id, JSON.stringify(defaultPost));
			setPost(defaultPost);
		} else {
			setPost(null);
		}
	}, [id]);

	const updatePost = useCallback(
		async (newPost: Partial<Post>) => {
			if (id) {
				// Merge old post with the new updates
				const updatedPost = { ...post, ...newPost };

				// Save the updated post to localStorage
				localStorage.setItem(id, JSON.stringify(updatedPost));

				// Update the state
				setPost(updatedPost);
			}
		},
		[id, post]
	);

	return [post, id ? updatePost : null];
}

export function filterProps(target: Partial<Post> | null, props: (keyof Post)[] = []): Partial<Post> | null {
	if (target === null) {
		return null
	}
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
export function useBufferedPost(
	id,
	props: (keyof PostDocData)[] = [],
	onBufferChange = (buffer: Partial<Post>) => { },
	onPull = (buffer: Partial<Post>) => { },
	onPush = (buffer: Partial<Post>) => { }):
	[Partial<Post>, (post: Partial<Post>) => void, Partial<Post> | null, () => Promise<void>, () => void, boolean, boolean] {
	const [post, setPost] = usePost(id, props)
	const filteredPost = filterProps(post, props)
	const [buffer, _setBuffer] = useState<Partial<Post>>(filteredPost === null ? (postSchema.getDefault() as Partial<Post>) : filteredPost) // filteredPost should not be null unless it is instantly deleted
	// Tracking changes to buffer / post
	const initialBufferRef = useRef(filteredPost)
	const postTriggersRef = useRef(0)
	const lastPostUpdateRef = useRef<Post | null>(null)
	const setBuffer = (newBuffer: Partial<Post>) => {
		// Inject
		_setBuffer(filterProps(newBuffer, props) as Partial<Post>)
		onBufferChange(newBuffer)
	}
	const [overwriteWarning, setOverwriteWarning] = useState(false)
	useEffect(() => { // Called whenever "post" updates
		// console.log(`BufferedPost ${id} updated:`, post)
		if (post !== null) { // Makes sure this update is not null, or else its kinda meaningless
			if (postTriggersRef.current > 0) { // Check if this is NOT the first update. If it is the first update, just do some initializing
				const filtered = filterProps(post, props)
				const filteredOld = filterProps(lastPostUpdateRef.current, props)
				if (!isEqual(filtered, filteredOld)) { // Okay, this is not the first update. Has the post's content actually changed since last time?
					if (!isEqual(buffer, filtered)) { // Okay the post content has actually changed! Well, have we changed the content in the meantime which would cause conflicts?
						console.warn("Buffer and post are not equal", buffer, filtered)
						setOverwriteWarning(true)
					}
					lastPostUpdateRef.current = post
				}
			} else {
				// console.log("First update", post)
				// Post initial update
				setBuffer(post)
				lastPostUpdateRef.current = post
				setOverwriteWarning(false)
				onBufferChange(post)
				onPull(post)
				
			}
			postTriggersRef.current++
		}
	}, [post])
	// To determine changed: If buffer is different than initially fetched
	// To determine overwriteWarning: If initial buffer is older than post, warn user that they may overwrite data if they push
	const push = async () => {
		if (post !== null) {
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
	}
	const pull = () => {
		if (post !== null && filteredPost !== null) {
			console.log("pulled")
			setBuffer(filteredPost)
			initialBufferRef.current = filteredPost
			setOverwriteWarning(false)
			onBufferChange(filteredPost)
			onPull(filteredPost)
		}
	}
	// console.log(bufferChanged, postChanged)
	// Change describes mismatch between buffer and post, OverwriteWarning indicates database has newer version than buffer
	// console.log(buffer, initialBufferRef.current)
	const changed = !isEqual(buffer, initialBufferRef.current)
	// console.log(changed)
	return [buffer, setBuffer, post, push, pull, changed, (overwriteWarning && post !== undefined)]
}
type GenericCallback = ((...args: any[]) => void) | ((...args: any[]) => Promise<void>)
export const useConfirm = (defaultText = "default", confirmText = "confirm", pendingText = "pending", onConfirm: GenericCallback = () => { }, onTimeout = () => { }) => {
	const [deleteState, setDeleteState] = useState(0) // 0: not deleted, 1: confirm (otherwise countdown), 2: requested
	const [countdown, setCountdown] = useState(3)
	const countdownRef = useRef<number | null>(null)
	const [intervalCb, setIntervalCb] = useState<null | ReturnType<typeof setInterval>>(null)
	useEffect(() => {
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

export function createEmptyMultilangString(): MultiLangString {
	// Transform languages array to an object with each language as key and empty string as value; languages is already imported
	return languages.reduce((obj, lang) => {
		obj[lang] = ""
		return obj
	}, {}) as MultiLangString
}

export function mergeThemes(defaultTheme: Theme, newTheme): Theme {
	// Merge default and new theme objects, with properties in new taking precedence. Although, if a property in new is null, fallback to default
	return Object.keys(newTheme).reduce((obj, key) => {
		obj[key] = newTheme[key] === null ? defaultTheme[key] : newTheme[key]
		return obj
	}, {}) as Theme
}

export function removeThemeTransition(theme: Theme) {
	return {
		...theme,
		transitionDuration: 0
	}
}

export const useTheme = (targetTheme: null | Theme) => {
	const { theme, setTheme, changesRef } = useContext(ThemeContext)
	useEffect(() => {
		return (
			() => {
				setTheme(defaultTheme)
				console.log("Reverted to default theme", defaultTheme)
			}
		)
	}, [])
	useEffect(() => {
		if (targetTheme !== null) {
			const newTheme = mergeThemes(defaultTheme, targetTheme) as Theme
			if (changesRef.current <= 1) {
				setTheme(removeThemeTransition(newTheme))
				console.log("Initial theme set", newTheme)
			} else {
				setTheme(newTheme)
				console.log("Theme changed", newTheme)
			}


		}
	}, [targetTheme])
}

export function Condition({ condition, children }) {
	return condition ? children : null
}

export function Switcher({ condition, trueChild, falseChild }) {
	return condition ? trueChild : falseChild
}

export function useChooseFile(validifier?: (file: File) => boolean, accept?: string): [createPrompt: () => void, file: File | null, valid: boolean | null, clearFiles: () => void] {
	// Returns createPrompt function and file object
	const [file, setFile] = useState<File | null>(null)
	const [valid, setValid] = useState<boolean | null>(null)
	// Create an input DOM object that will be used to trigger the file upload prompt
	const inputRef = useRef<HTMLInputElement | null>(null)
	useEffect(() => {
		inputRef.current = document.createElement("input")
		inputRef.current.type = "file"
		inputRef.current.style.display = "none"
		inputRef.current.accept = accept || "*"
		inputRef.current.addEventListener("change", (e) => {
			if (e.target === null) { // If the event is not triggered by the input element
				return
			}
			const files = (e.target as HTMLInputElement).files
			if (files !== null && files.length > 0) { // If there is a file
				setFile(files[0])
				if (validifier) {
					setValid(validifier(files[0]))
				} else {
					setValid(null)
				}
			} else { // If there is no file
				setFile(null)
				setValid(null)
			}
		})
	}, [])
	const createPrompt = () => {
		inputRef.current && inputRef.current.click()
	}
	const clearFiles = () => {
		if (inputRef.current) {
			inputRef.current.value = null
		}
		setFile(null)
		setValid(null)
	}
	return [createPrompt, file, valid, clearFiles]
}

export async function logOut() {
	await signOut(auth)
}

export function useMounted() {
	const mounted = useRef(false)
	useEffect(() => {
		mounted.current = true
		return () => {
			mounted.current = false
		}
	}, [])
	return mounted
}

export function useLazyEffect(callback, dependencyArray) { // Hacky workaround for the moment
	const lastArrayContentRef = useRef(null)
	const numUpdatesRef = useRef(0)
	useEffect(() => {
		if (numUpdatesRef.current > 0) {
			if (!isEqual(dependencyArray, lastArrayContentRef.current)) {
				callback()
			}
		} else {
			callback()
			lastArrayContentRef.current = dependencyArray
		}
		numUpdatesRef.current++
	}, dependencyArray)
}

export function unionMatch(listA, listsB) {
	// Returns true if any of the elements in listA is in listB
	return listA.some(x => listsB.includes(x))
}

export function findAsset(post: Post, assetID: string): Asset | null {
	// Returns the asset with the given ID
	return post?.assets?.find(x => x.id === assetID)?.data || null
}

/**
 * Returns an image url or null for a given sponsor
 * @param postInstance 
 * @param sponsorInstance 
 * @returns 
 */
export function getSponsorImageURL(postInstance: Instance<Post>, sponsorInstance: Instance<Sponsor>): string | null {
	if (sponsorInstance.data.imageAssetID) {
		// console.log(findAsset(postInstance.data, sponsorInstance.data.imageAssetID))
		const url = VaporAPI.resolveAsset(postInstance.id, sponsorInstance.data.imageAssetID) + findAsset(postInstance.data, sponsorInstance.data.imageAssetID)?.data?.fileName
		if (url === null || url === undefined || url === "") {
			console.warn("Invalid sponsor image URL", url)
		}
		return url
	} else {
		return null
	}
}

export function useMagicString(value: MagicString) {
	const { settings } = useContext(SettingsContext)
	if (typeof value === "string") {
		return value
	} else {
		return value[settings.lang]
	}
}

// From: https://usehooks.com/useEventListener/
export function useEventListener(eventName, handler, element: any = window) {
	// Create a ref that stores handler
	const savedHandler = useRef();
	// Update ref.current value if handler changes.
	// This allows our effect below to always get latest handler ...
	// ... without us needing to pass it in effect deps array ...
	// ... and potentially cause effect to re-run every render.
	useEffect(() => {
		savedHandler.current = handler;
	}, [handler]);
	useEffect(
		() => {
			// Make sure element supports addEventListener
			// On
			const isSupported = element && element.addEventListener;
			if (!isSupported) return;
			// Create event listener that calls handler function stored in ref
			const eventListener = (event) => savedHandler.current(event);
			// Add event listener
			element.addEventListener(eventName, eventListener);
			// Remove event listener on cleanup
			return () => {
				element.removeEventListener(eventName, eventListener);
			};
		},
		[eventName, element] // Re-run if eventName or element changes
	);
}

export type EventDispatcherEvent = {
	type: string,
	message: any,
	// Allow for additional data to be passed along
	[key: string]: any
}

export type EventDispatcherListener = (event: EventDispatcherEvent) => void

/**
 * Hook for using Mr. Doob's EventDispatcher instead of native events, similar to useEventListener
 * @param eventName the event name string to listen to
 * @param handler the handler function to call when the event is dispatched
 * @param dispatcher the EventDispatcher instance to use
 */
export function useThreeEventListener(eventName: string, handler: EventDispatcherListener, dispatcher: EventDispatcher | null) {
	const savedHandler = useRef<EventDispatcherListener>(() => { });
	// Update ref.current value if handler changes.
	useEffect(() => {
		savedHandler.current = handler;
	}, [handler])
	// Create event listener that calls handler function stored in ref
	useEffect(() => {
		if (!dispatcher) {
			// console.warn("No EventDispatcher instance provided")
			return
		}
		// Create event listener that calls handler function stored in ref
		const eventListener = (event) => savedHandler.current(event);
		// Add event listener
		dispatcher.addEventListener(eventName, eventListener);
		// Remove event listener on cleanup
		return () => {
			dispatcher.removeEventListener(eventName, eventListener);
		};

	})
}

export function useRefContext<T>(context: Context<T>): MutableRefObject<T | undefined> {
	const ref = useRef<T>()
	const value = useContext(context)
	useEffect(() => {
		ref.current = value
	}, [value])
	return ref
}

export function NonXRComponents({ children }) {
	const { xrMode } = useContext(ViewerContext)
	if (xrMode) {
		return null
	} else {
		return children
	}
}

export function useArrayUpdateDiff(array: any[]) {
	const oldArrayRef = useRef<any>([])
	const [diff, setDiff] = useState({ added: [], removed: [] })
	useEffect(() => {
		// On "array" change
		// Diff what references are added and removed
		const added = array.filter(x => !oldArrayRef.current.includes(x))
		const removed = oldArrayRef.current.filter(x => !array.includes(x))
		// Call callback with added 
		setDiff({ added, removed })
		// Update old array
		oldArrayRef.current = array
	}, [array])
	return diff
}

export type DeviceType = 'desktop' | 'mobile';

export function useDeviceType(): DeviceType {
	const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
	const mobile = useMediaQuery({ query: '(max-width: 768px)' });
	useEffect(() => {
		if (mobile) {
			setDeviceType('mobile');
		} else {
			setDeviceType('desktop');
		}
	}, [mobile])
	return deviceType;
}

export function usePosts() {
	const posts = useContext(ContentContext)
	return posts
}

export function usePostsFilter(posts) {
	const filtered = useMemo(() => {
		return hidePosts(posts)
	}, [posts])
	return filtered
}

export function useFilteredPosts() {
	const unfilteredPosts = usePosts()
	const filteredPosts = usePostsFilter(unfilteredPosts)
	return filteredPosts
}

export function useIsLoggedIn() {
	const { currentUser } = useContext(AuthContext)
	const isLoggedIn = useMemo(() => {
		return currentUser !== null
	}, [currentUser])
	return isLoggedIn
}

export function useViewportDepthBuffer() {
	throw new Error("Not implemented")
	const { _setNumDepthBufferDependents, depthBuffer } = useContext(ViewerContext)
	useEffect(() => {
		_setNumDepthBufferDependents((n) => n + 1)
		return () => {
			_setNumDepthBufferDependents((n) => n - 1)
		}
	}, [])
	return depthBuffer
}