Creating new types
- Asset types (e.g. Potree2) are format specifications for a collection of asset files to be uploaded to the static server
    - To create a new asset type:
        - Create a new file in /functions/src/lib/types/asset_types for the cloud function to know how to handle the asset type
        - Update the sourceAssetLiteral / targetAssetLiteral definintions in /api/types to include the new asset type
        - Update /functions/src/lib/types/AssetType.ts to include the new asset type
    - To use assets as an argument in VaporComponents
        - Create a entry in the input property in the following format:
        {VaporComponent}.inputs = {
            ...genericInputs,
            {someAsset}: {
                type: createAssetType([{List of accepted asset types}]),
                default: null
            },
            ...
        }
        Once the input is set, the asset will be supplied as a prop in the format of a ClientAsset, and to get the baseUrl, you need to use VaporAPI.resolveAsset(postID, assetID)
- VaporComponent types are special 3D components that have extra logic that allows it to be recognized in the Editor and allows prop editing