interface GeneralSettings {
  port: number;
  banner: string;
  invalidCmdMsg: string;
};

interface PromptSettings {
  default: string;
  continuation: string;
  selection: string;
  lines: string;
};

export default interface Settings {
  general: GeneralSettings;
  prompt: PromptSettings;
};

const defaultSettings: Settings = {
  general: {
    port: 22,
    banner: '',
    invalidCmdMsg: '',
  },
  prompt: {
    default: '',
    continuation: '',
    selection: '',
    lines: '',
  },
};

export { defaultSettings };
