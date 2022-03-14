import { cloneDeep, merge } from 'lodash';
import { to } from 'react-spring';
// The contents of this file are to define the default value of common API types, and provide some helper functions to create these types.
// All helper functions are stateless and can be used anywhere.
import { Asset, AssetStatus, MultiLangString, Permissions, Post, RecursivePartial } from "./types";
import { Timestamp } from 'firebase/firestore';

export default class Defaults {
    
    static readonly defaultMultiLangString: MultiLangString = {
        en: "",
        zh: "",
    }

    static readonly defaultPermissions: Permissions = {
        owner: "",
        editors: [],
        viewers: [],
        public: false
    }
    
    static readonly defaultPost: Post = {
        id: "",
        title: Defaults.defaultMultiLangString,
        description: Defaults.defaultMultiLangString,
        data: {
            configuration: {
                defaultCameraProps: {
                    position: [0,0,0],
                    rotation: [0,0,0],
                    fov: 90,
                },
                potreePointBudget: 100000,
            },
            sceneChildren: []
        },
        metadata: {
            createdAt: new Date(0).toISOString(),
            updatedAt: new Date(0).toISOString(),
            permissions: Defaults.defaultPermissions,
            assets: []
        }
    }

    static readonly defaultAssetStatus: AssetStatus = {
        uploaded: false,
        pending: true,
        processedProgress: 0,
        processed: false,
        ready: false
    }
    
    static readonly defaultAsset: Asset = {
        id: "",
        name: "",
        sourceAssetType: "",
        targetAssetType: "",
        data: {},
        metadata: {
            createdAt: new Date(0).toISOString(),
            permissions: Defaults.defaultPermissions,
            status: Defaults.defaultAssetStatus
        }
    }

    static fillPartials<T>(template:T, ...partials:RecursivePartial<T>[]): T {
        const base = cloneDeep(template);
        return merge(base, ...partials);
    }
}