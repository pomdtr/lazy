import * as nunjucks from "nunjucks";
import { Lazy } from "./lazy";

nunjucks.installJinjaCompat()
const templateEnv = new nunjucks.Environment(null, { autoescape: false, throwOnUndefined: true, noCache: true });

export function renderObj(templatedObject: any, params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(templatedObject).map(([key, value]) => [
      key,
      typeof value == "string" ? renderString(value, params) : value,
    ])
  );
}

export function renderString(template: string, params: Record<string, unknown>) {
  try {
    return templateEnv.renderString(template, {
      ...params,
    });
  } catch (error) {
    throw Error(JSON.stringify({ template, params, error }, null, 2));
  }
}

export function renderAction(action: Lazy.Action, templateParams: Record<string, unknown>) {
  if (action.type == "push")
    return {
      ...renderObj(action, templateParams),
      params: renderObj(action.params || {}, templateParams),
    } as Lazy.Action;
  return renderObj(action, templateParams);
}
