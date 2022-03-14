import { componentLiteralSchema } from './ComponentLiteral';
import { componentPropsSchema } from './ComponentProps';
import { object, string, InferType } from 'yup';

export const sceneComponentSchema = object({
    componentType: componentLiteralSchema.required(),
    props: componentPropsSchema.required()
})

export type SceneComponent = InferType<typeof sceneComponentSchema>