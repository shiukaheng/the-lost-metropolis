// import { array, boolean, InferType, object } from 'yup';
// import { userIDSchema } from './UserID';

// export const permissionsSchema = object({
//     owner: userIDSchema.defined().default(""),
//     viewers: array(userIDSchema).required().default([]),
//     editors: array(userIDSchema).required().default([]),
//     public: boolean().required().default(false)
// })

// export type Permissions = InferType<typeof permissionsSchema>