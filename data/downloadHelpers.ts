import { existsSync } from "fs";

export default function downloadHelper(dataSourceName: string) {
  dataSourceName = import.meta.dir + "/../cache/" + dataSourceName + "/";
  const cacheExists = (file: string) => {
    return existsSync(dataSourceName + file);
  };

  const writeToCache = (
    path: string,
    input: string | Blob | NodeJS.TypedArray | ArrayBufferLike | Bun.BlobPart[]
  ) => {
    return Bun.write(dataSourceName + path, input);
  };

  const overload = (path: string) => {
    return {
      cache: {
        write: (input: Parameters<typeof writeToCache>[1]) =>
          writeToCache(path, input),
        exists: () => cacheExists(path),
      },
    };
  };

  return {
    cache: {
      write: writeToCache,
      exists: cacheExists,
    },
    overload,
  };
}
