import { mixed } from "yup"
import { tuple } from "./utilities"

export const componentLiteral = tuple("DebugPlane", "DepthKitObject", "InfoObject", "LinkObject", "PotreeObject", "TestObject")
export type ComponentLiteral = typeof componentLiteral[number]
export const componentLiteralSchema = mixed<ComponentLiteral>().oneOf(componentLiteral)