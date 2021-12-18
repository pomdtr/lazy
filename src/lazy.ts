/* eslint-disable @typescript-eslint/no-namespace */
export namespace Lazy {
  export interface Config {
    requirements?: string[];
    packageName: string;
    preferences?: StepEnv;
    steps: {
      [step_id: string]: Step;
    };
    rootActions: Action[];
  }

  export interface Step {
    /**
     * @ignore
     */
    packageName: string;
    params?: StepEnv;
    generator: string | Command;
    items?: ItemTemplate;
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
    actions?: Action[];
  }

  export interface List {
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

  export interface PushAction extends BaseAction, StepReference {
    type: "push"
  }

  export interface OpenAction extends BaseAction {
    type: "open";
    target: string;
  }

  export interface CopyAction extends BaseAction {
    type: "copy";
    content: string;
  }

  export type Action = RunAction | PushAction | OpenAction | CopyAction;

  export interface Package {
    steps: { [stepId: string]: Step };
    preferences: StepEnv;
  }

  export interface StepEnv {
    [key: string]: unknown;
  }
}
