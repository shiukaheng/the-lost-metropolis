import VaporAPI from "../../../api_client/api";
import { ClientAsset, clientAssetSchema } from "../../../api_client/types/ResolvedAsset";
import { createAssetType } from "../../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../../viewer/ComponentDeclarations";
import { genericInputs } from "../../viewer/genericInputs";
import { PotreeObject } from "../PotreeObject";

type PotreeAssetObjectProps = VaporComponentProps & {
    potreeAsset: ClientAsset | null,
    pointSize: number,
    pointSizeType: 0 | 1 | 2,
    pointShape: 0 | 1 | 2,
}

export const PotreeAssetObject: VaporComponent = ({potreeAsset, ...props}: PotreeAssetObjectProps) => {
    // Check assets validity
    if (potreeAsset === null) {
        return null
    } else {
        clientAssetSchema.validateSync(potreeAsset)
        if (potreeAsset.type !== "Potree2") {
            throw new Error("Invalid asset type")
        }
        return (
            <PotreeObject {...props} baseUrl={VaporAPI.resolveAsset(potreeAsset.postID, potreeAsset.assetID)} cloudName={"metadata.json"}/>
        )
    }
}

PotreeAssetObject.displayName = "Potree Object"
PotreeAssetObject.componentType = "PotreeAssetObject"
PotreeAssetObject.inputs = {
    ...genericInputs,
    potreeAsset: {
        type: createAssetType(["Potree2"]),
        default: null
    }
}