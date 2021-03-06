/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ActionPanel,
  closeMainWindow,
  copyTextToClipboard,
  CopyToClipboardAction,
  Detail,
  getPreferenceValues,
  Icon,
  List,
  popToRoot,
  PushAction,
  showHUD,
  Toast,
  ToastStyle
} from "@raycast/api";
import { spawnSync } from "child_process";
import { homedir } from "os";
import { useEffect, useState } from "react";
import { Lazy } from "./lazy";

const { "lazy-path": PATH } = getPreferenceValues();
process.env.PATH = PATH.replace("~", homedir());

const codeblock = (text: string) => "```\n" + text + "\n```";

export function Preview(props: { command: Lazy.Command }) {
  const [content, setContent] = useState<string>();
  useEffect(() => {
    const input = JSON.stringify(props.command);
    try {
      const { stdout } = spawnSync("lazy", ["run"], { input, encoding: "utf8" });
      setContent(stdout);
    } catch (e: any) {
      console.error(e);
      const toast = new Toast({
        title: "An error occured!",
        style: ToastStyle.Failure,
        primaryAction: { title: "Copy Error", onAction: () => copyTextToClipboard(e.message) },
      });
      toast.show();
    }
  }, []);
  return (
    <Detail
      isLoading={typeof content == "undefined"}
      markdown={content ? codeblock(content) : undefined}
      actions={<ActionPanel>{content ? <CopyToClipboardAction content={content} /> : null}</ActionPanel>}
    />
  );
}

export function Step(props: { reference?: Lazy.StepReference }) {
  const { reference } = props;
  const [state, setState] = useState<{ items?: Lazy.Item[]; isLoading: boolean }>({ isLoading: true });

  const refreshItems = () => {
    const input = props.reference ? JSON.stringify(reference) : undefined;
    const args = input ? ["ls", "-"] : ["ls"];
    try {
      const { stdout } = spawnSync("lazy", args, { input, encoding: "utf8", maxBuffer: 1024 * 1024 * 10 });
      const items = stdout
        .split("\n")
        .filter((line) => line)
        .map((line) => JSON.parse(line));
      setState({ items, isLoading: false });
    } catch (e: any) {
      console.error(e);
      const toast = new Toast({
        title: "An error occured!",
        style: ToastStyle.Failure,
        primaryAction: { title: "Copy Error", onAction: () => copyTextToClipboard(e.message) },
      });
      toast.show();
    }
  };

  useEffect(refreshItems, []);

  return (
    <List isLoading={state.isLoading}>
      {state.items?.map((item, index) => (
        <ListItem item={item} key={index} />
      ))}
    </List>
  );
}

export function ListItem(props: { item: Lazy.Item }) {
  const item = props.item;
  return (
    <List.Item
      title={item.title}
      subtitle={item.subtitle}
      actions={
        <ActionPanel>
          {item.actions?.map((action, index) => {
            if (action.condition == "false") return null;
            if (action.type == "push") {
              return (
                <PushAction
                  key={index}
                  title={action.title}
                  icon={Icon.ArrowRight}
                  target={<Step reference={action} />}
                />
              );
            }
            return <Action key={index} action={action} />;
          })}
          {item.preview ? (
            <PushAction
              title="Show Preview"
              icon={Icon.Text}
              target={<Preview command={item.preview as unknown as Lazy.Command} />}
            />
          ) : null}
        </ActionPanel>
      }
    />
  );
}

export function Action(props: { action: Lazy.RunAction | Lazy.CopyAction | Lazy.OpenAction; onAction?: () => void }) {
  const { action, onAction } = props;

  const runCommand = async () => {
    const input = JSON.stringify(props.action);
    try {
      closeMainWindow();
      const { stdout } = spawnSync("lazy", ["run"], { input, encoding: "utf-8" });
      if (stdout) showHUD(stdout);
      await popToRoot();
    } catch (e: any) {
      console.error(e);
      const toast = new Toast({
        title: "An error occured!",
        style: ToastStyle.Failure,
        primaryAction: { title: "Copy Error", onAction: () => copyTextToClipboard(e.message) },
      });
      toast.show();
    }
  };

  return (
    <ActionPanel.Item
      title={action.title}
      icon={Icon.Hammer}
      onAction={async () => {
        await runCommand();
        if (onAction) onAction();
      }}
    />
  );
}
