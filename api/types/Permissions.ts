import { array, boolean, InferType, object } from 'yup';
import { userIDSchema } from './UserID';

export const permissionsSchema = object({
    owner: userIDSchema.required(),
    viewers: array(userIDSchema).required(),
    editors: array(userIDSchema).required(),
    public: boolean().required()
})

export type Permissions = InferType<typeof permissionsSchema>