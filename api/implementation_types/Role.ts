import { mixed } from 'yup';
import { tuple } from '../types/utilities';

export const role = tuple("owner", "editor", "viewer", "public")
export type Role = typeof role[number]
export const roleSchema = mixed<Role>().oneOf(role)

export type Roled<T> = T & { role: Role }