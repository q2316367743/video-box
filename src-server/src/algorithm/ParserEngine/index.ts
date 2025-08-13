import {ParserEngineProxy} from "@/algorithm/ParserEngine/ParserEngineProxy";
import {DomParseEngine} from "@/algorithm/ParserEngine/DomParseEngine";
import {ParserEngine} from "@/algorithm/ParserEngine/types";

export function buildDomParseEngin(html: string): ParserEngine {
  return new ParserEngineProxy(new DomParseEngine(html));
}
