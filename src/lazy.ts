/* eslint-disable @typescript-eslint/no-namespace */
export namespace Lazy {
  export interface Config {
    requirements?: string[];
    packageName: string;
    filepath?: string;
    preferences?: StepEnv;
    steps: {
      [step_id: string]: Step;
    };
    roots: Action[];
  }

  export interface BaseStep {
    /**
     * @ignore
     */
    packageName: string;
    params?: StepEnv;
  }

  export interface DynamicList extends BaseStep {
    type: "filter" | "query";
    generator: string | Command;
    items?: ItemTemplate;
  }

  export interface QueryList extends DynamicList {
    type: "query";
  }

  export interface FilterList extends DynamicList {
    type: "filter";
    cache?: Cache;
  }

  export interface Cache {
    key: string,
    duration: string
  }

  export interface Item {
    title: string;
    subtitle?: string;
    preview?: Command;
    actions?: Action[];
  }

  export interface ItemTemplate {
    title?: string;
    subtitle?: string;
    preview?: string | Command;
    delimiter?: string;
    actions?: Action[];
  }

  export type Step = FilterList | QueryList;

  export interface List {
    type: "filter" | "query"
    items: Lazy.Item[]
  }

  export interface Command {
    command: string;
    updateItems?: boolean;
    errorMessage?: string;
    skip_lines?: number;
    shell?: string;
  }

  interface BaseAction {
    title: string;
    condition?: string;
  }

  export interface RunAction extends Command, BaseAction {
    type: "run";
    updateItems?: boolean;
    confirm?: boolean;
  }

  export interface StepReference {
    target: string;
    /**
     * @ignore
     */
    packageName: string;
    title: string;
    params?: StepEnv;
  }

  export interface RefAction extends BaseAction, StepReference {
    type: "ref"
  }

  export type Action = RunAction | RefAction;

  export interface Package {
    steps: { [stepId: string]: Step };
    preferences: StepEnv;
  }

  export interface Root {
    refs: RefAction[];
    packageName: string;
  }

  export interface StepEnv {
    [key: string]: unknown;
  }
}
