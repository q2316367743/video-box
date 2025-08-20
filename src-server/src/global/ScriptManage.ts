import {SourceNewsRecordView} from "@/types/SourceNews";
import {http} from "@/global/http";
import {load} from "cheerio";
import {SourceRandomRecordType} from "@/types/SourceRandom";

export async function getNewsRecords(script: string): Promise<Array<SourceNewsRecordView>> {
  const dataUrl = `data:text/javascript;base64,${btoa(script)}`;
  const module = await import(dataUrl);
  const records: Array<SourceNewsRecordView> = await module.default({
    http: http,
    load: load
  });
  if (!records) return Promise.reject(new Error("获取资讯失败"));
  if (!Array.isArray(records)) return Promise.reject(new Error("获取资讯失败"));
  return records || [];
}

export async function getRandomRecords(script: string, tag: string): Promise<Array<SourceRandomRecordType>> {
  const dataUrl = `data:text/javascript;base64,${btoa(script)}`;
  const module = await import(dataUrl);
  const records: Array<SourceRandomRecordType> = await module.default({
    http: http,
    load: load
  }, tag);
  if (!records) return Promise.reject(new Error("获取失败"));
  if (!Array.isArray(records)) return Promise.reject(new Error("获取失败"));
  return records || [];
}