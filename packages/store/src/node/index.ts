// The store's Node edges: the only store modules that touch files.

export { objectPath, readObjectFile, removeObjectFile, writeObjectFile } from "./object-file.ts";
export { backupsFolder, writeBackup } from "./backup.ts";
export { readObject, removeObject, writeObject } from "./store-object.ts";
export type { Found, ObjectRead, ObjectWrite } from "./store-object.ts";
