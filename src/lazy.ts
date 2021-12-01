/* eslint-disable @typescript-eslint/no-namespace */
export namespace Lazy {
  export interface Config {
    requirements?: string[];
    packageName: string;
    icon?: string;
    /**
     * @ignore
     */
    filepath: string;
    prefs?: StepEnv;
    steps: {
      [step_id: string]: Step;
    };
    roots: RefAction[];
  }

  export interface List {
    /**
     * @ignore
     */
    packageName: string;
    /**
     * @ignore
     */
    prefs: StepEnv;
    params?: StepEnv;
  }

  export interface DynamicList extends List {
    type: "filter" | "query";
    items: ItemTemplate;
  }

  export interface QueryList extends DynamicList {
    type: "query";
  }

  export interface FilterList extends DynamicList {
    type: "filter";
  }

  export interface Item {
    title: string;
    subtitle?: string;
    icon?: string;
    preview?: string;
    actions?: Action[];
  }

  export interface ItemTemplate {
    title?: string;
    subtitle?: string;
    icon?: string;
    preview?: string;
    delimiter?: string;
    generator: string | Command;
    actions?: Action[];
  }

  export type Step = FilterList | QueryList;

  export interface Command {
    command: string;
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
    prefs: StepEnv;
  }

  export interface Root {
    icon?: string;
    refs: RefAction[];
    packageName: string;
  }

  export interface StepEnv {
    [key: string]: unknown;
  }
}
