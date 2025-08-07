import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {DiskFileLink} from "@/modules/disk/DiskPlugin";

export async function commonReadFile(request: Request, file: SourceDiskDir, getFileDownloadLink: (file: SourceDiskDir) => Promise<DiskFileLink>): Promise<Response> {
  const link = await getFileDownloadLink(file);
  if (request.signal.aborted) return Promise.resolve(new Response("已被终止", {
    status: 500,
    statusText: 'REQUEST_ABORT'
  }));
  const rsp = await fetch(link.url, {
    headers: {
      ...request.headers,
      ...link.headers
    },
    signal: request.signal
  });
  return new Response(rsp.body, {
    headers: rsp.headers,
    status: rsp.status,
    statusText: rsp.statusText
  });
}