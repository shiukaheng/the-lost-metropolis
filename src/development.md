# Todo

- Create asset uploading client
- Make assets renameable and identifiable by ID -> Improve Assets schema and unify for frontend and backend
- Make .vaps format support multiple assets within one file

# Creating new types

## Asset types

Asset types (e.g. Potree2) are format specifications for a collection of asset files to be uploaded to the static server

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

## VaporComponents

VaporComponent types are special 3D components that have extra logic that allows it to be recognized in the Editor and allows prop editing

# Improvements

- Currently ViewerContext and EditorContext are just one big object with unrelated functionality, and some setValue functions are even passed down, causing some infinite rendering loop issues if setting of one property affects the value of another. Should seperate these into different contexts, but the reason why I initially structured like this is for ease of use. Perhaps find a state management library to improve this? Using useLazyEffect custom hook to get around this but is incredibly hacky. Basically does deep check of dependencyArray to see if the value has actually changed, and only actually call the callback if it did change. Will have impact on performance since these comparisons are not cheap if the dependencies are complex.
