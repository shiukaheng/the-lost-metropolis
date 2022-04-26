import VaporAPI from "../../../api_client/api";
import { ClientAsset, clientAssetSchema } from "../../../api_client/types/ClientAsset";
import { createAssetType } from "../../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../../viewer/ComponentDeclarations";
import { genericInputs } from "../../viewer/genericInputs";
import { NexusObject } from "../NexusObject";
import { PotreeObject } from "../PotreeObject";

type NexusAssetObjectProps = VaporComponentProps & {
    url: string;
}

export const NexusAssetObject: VaporComponent = ({nexusAsset, ...props}: NexusAssetObjectProps) => {
    // Check assets validity
    if (nexusAsset === null) {
        return null
    } else {
        clientAssetSchema.validateSync(nexusAsset)
        if (nexusAsset.type !== "Nexus") {
            throw new Error("Invalid asset type")
        }
        return (
            <NexusObject {...props} url={VaporAPI.resolveAsset(nexusAsset.postID, nexusAsset.assetID).concat("mesh.nxz")}/>
        )
    }
}

NexusAssetObject.displayName = "Nexus Asset Object"
NexusAssetObject.componentType = "NexusAssetObject"
NexusAssetObject.inputs = {
    ...genericInputs,
    nexusAsset: {
        type: createAssetType(["Nexus"]),
        default: null
    }
}