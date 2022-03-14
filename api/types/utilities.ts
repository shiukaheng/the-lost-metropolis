export const tuple = <T extends string[]>(...args: T) => args;
export const nullable_tuple = <T extends string[]>(...args: T) => [...args, null];