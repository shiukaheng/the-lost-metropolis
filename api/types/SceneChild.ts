import { componentLiteralSchema } from './ComponentLiteral';
import { object, InferType } from 'yup';

export const sceneChildSchema = object({
    componentType: componentLiteralSchema.required(),
    props: object().required() // Could optimize to use "lazy" to check against implementation validator
})

export type SceneChild = InferType<typeof sceneChildSchema>