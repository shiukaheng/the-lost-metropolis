import { useFrame, useThree } from "@react-three/fiber";
import { LRUCache, TilesRenderer, PriorityQueue } from '3d-tiles-renderer';
import { useEffect, useRef, useContext, useCallback } from "react";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ArrayCamera, Group } from "three";
import { TilesContext } from "../managers/TilesManager";
import { useXR } from "@react-three/xr";

// As a more long term target, allow TilesObject to incorporate BVH per tile for faster raycasting

export type ProtoTilesObjectProps = {
    url: string;
    dracoDecoderUrl?: string;
    // TilesRenderer props
    fetchOptions?: object;
    errorTarget?: number;
    errorThreshold?: number;
    maxDepth?: number;
    loadSiblings?: boolean,
    displayActiveTiles?: boolean,
    autoDisableRendererCulling?: boolean,
    optimizeRaycast?: boolean,
    onPreprocessURL?: null | ((url: string) => string),
    // Allow extra props
    [key: string]: any;
}

export function ProtoTilesObject({
    url, 
    dracoDecoderUrl="https://unpkg.com/three@0.123.0/examples/js/libs/draco/gltf/",
    // TilesRenderer props
    fetchOptions={},
    errorTarget=6,
    errorThreshold=Infinity,
    maxDepth=Infinity,
    loadSiblings=true,
    displayActiveTiles=false,
    autoDisableRendererCulling=true,
    optimizeRaycast=true,
    onPreprocessURL=null,
     ...props}: ProtoTilesObjectProps) {
    const {gl, camera} = useThree()
    const { isPresenting } = useXR()
    const containerRef = useRef<Group>()
    const tilesRendererRef = useRef<TilesRenderer>()
    const dracoLoaderRef = useRef<DRACOLoader>()
    const tilesManager = useContext(TilesContext)
    const updateRendererProps = useCallback(()=>{
        if (tilesRendererRef.current) {
            Object.assign(tilesRendererRef.current, {
                fetchOptions,
                errorTarget,
                errorThreshold,
                maxDepth,
                loadSiblings,
                displayActiveTiles,
                autoDisableRendererCulling,
                optimizeRaycast,
                onPreprocessURL
            })
        }
    }, [fetchOptions, errorTarget, errorThreshold, maxDepth, loadSiblings, displayActiveTiles, autoDisableRendererCulling, optimizeRaycast, onPreprocessURL])
    useEffect(()=>{
        dracoLoaderRef.current = new DRACOLoader();
        dracoLoaderRef.current.setDecoderPath(dracoDecoderUrl);
    }, [dracoDecoderUrl])
    useEffect(()=>{
        // Cleanup existing tiles renderer
        if (tilesRendererRef.current) {
            tilesRendererRef.current.group.removeFromParent()
            tilesRendererRef.current.dispose()
        }
        // Create new tiles renderer and add to container
        tilesRendererRef.current = new TilesRenderer(url);
        const loader = new GLTFLoader( tilesRendererRef.current.manager );
        loader.setDRACOLoader( dracoLoaderRef.current as DRACOLoader );
        tilesRendererRef.current.manager.addHandler( /\.gltf$/, loader );
        tilesRendererRef.current.setCamera(camera);
        tilesRendererRef.current.setResolutionFromRenderer(camera, gl);
        (containerRef.current as Group).add(tilesRendererRef.current.group);
        updateRendererProps();
        // Link to TilesManager if available
        if (tilesManager) {
            if (tilesManager.initializedRef.current === false) {
                tilesManager.lruCacheRef.current = tilesRendererRef.current.lruCache
                tilesManager.downloadQueueRef.current = tilesRendererRef.current.downloadQueue
                tilesManager.parseQueueRef.current = tilesRendererRef.current.parseQueue
                tilesManager.initializedRef.current = true
            } else {
                tilesRendererRef.current.lruCache = (tilesManager.lruCacheRef.current as LRUCache)
                tilesRendererRef.current.downloadQueue = (tilesManager.downloadQueueRef.current as PriorityQueue)
                tilesRendererRef.current.parseQueue = (tilesManager.parseQueueRef.current as PriorityQueue)
            }
        }
    }, [gl, camera, tilesManager])
    // Keep TilesRenderer properties in sync with props
    useEffect(()=>{
        updateRendererProps()
    }, [updateRendererProps])
    // Update tiles renderer
    useFrame(() => {
        if (tilesRendererRef.current) {
            tilesRendererRef.current.update()
        }
    })
    // Change camera if XR is active
    useEffect(()=>{
        if (tilesRendererRef.current) {
            if (isPresenting) {
                const xrCamera = (gl.xr.getCamera() as ArrayCamera) // Wrong types!
                console.log(xrCamera)
                // Remove all cameras so we can use the XR camera instead
                tilesRendererRef.current?.cameras.forEach(
                    c => tilesRendererRef.current?.deleteCamera(c)
                )
                tilesRendererRef.current.setCamera(xrCamera)
                const leftCam = xrCamera.cameras[0]
                if (leftCam) {
                    tilesRendererRef.current.setResolution(xrCamera, leftCam.viewport.z, leftCam.viewport.w)
                }

            } else {
                // Delete all cameras
                tilesRendererRef.current?.cameras.forEach(
                    c => tilesRendererRef.current?.deleteCamera(c)
                )
                tilesRendererRef.current.setCamera(camera)
                tilesRendererRef.current.setResolutionFromRenderer(camera, gl)
            }
        }
    }, [isPresenting, camera, gl])
    return (
        <group ref={containerRef} {...props}/>
    )
}