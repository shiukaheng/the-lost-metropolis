import { array, number, SchemaOf } from 'yup';

export type Color = [number, number, number]
export const colorSchema: SchemaOf<Color> = array(number().required()).length(3)