import { SourceWeb } from "@/types/SourceWeb";
import { selectList } from "@/utils/SqlUtil";

export async function sourceWebList(params: Partial<Omit<SourceWeb, "props">> = {}): Promise<Array<SourceWeb>> {
  const list = await selectList<SourceWeb>('source_web', params);
  return list.map(e => ({
    ...e,
    props: JSON.parse(e.props)
  }))
}
