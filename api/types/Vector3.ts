import { array, number, SchemaOf } from 'yup';

export type Vector3 = [number, number, number]
export const vector3Schema: SchemaOf<Vector3> = array(number().required()).length(3)