type SettingItemBase = {
  id: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
};

export type ToggleSettingItem = SettingItemBase & {
  type: "toggle";
  value: boolean;
  onValueChange: (next: boolean) => void;
};

export type ActionSettingItem = SettingItemBase & {
  type: "action";
  danger?: boolean;
  rightLabel?: string;
  onPress: () => void | Promise<void>;
};

export type NavigationSettingItem = SettingItemBase & {
  type: "navigation";
  rightLabel?: string;
  onPress: () => void | Promise<void>;
};

export type SettingItem = ToggleSettingItem | ActionSettingItem | NavigationSettingItem;
