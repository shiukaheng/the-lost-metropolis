import { mixed } from "yup"
import { tuple } from "./utilities"

export const componentLiteral = tuple("DebugPlane", "DepthKitObject", "InfoObject", "LinkObject", "PotreeObject", "TestObject", "PotreeAssetObject", "NexusObject", "NexusAssetObject", "AmbientLight", "TilesObject", "TeleporterPlane", "AudioObject", "ReflectorPlane", "Spotlight", "SkyBox")
export type ComponentLiteral = typeof componentLiteral[number]
export const componentLiteralSchema = mixed<ComponentLiteral>().oneOf(componentLiteral)