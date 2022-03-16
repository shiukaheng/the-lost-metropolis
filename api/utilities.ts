import { object, SchemaOf, string } from "yup"
import { Instance } from "./utility_types"

export function instance<T>(target: T, id: string): Instance<T> {
    return {
        id,
        data: target
    }
}

export function uninstance<T>(target: Instance<T>): [data: T, id: string] {
    return [target.data, target.id]
}

// export function instanceSchema<T>(x: SchemaOf<T>): SchemaOf<Instance<T>> { 
//     return object({
//         id: string(),
//         data: x
//     })
// }