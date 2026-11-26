// The shape of a settings file once it is read, as spec/settings.md describes.

export type Site = {
  business: string;
  platform: string;
  address: string;
  keyName?: string;
};

export type Store = {
  name: string;
  connector: string;
  where: string;
  keyName?: string;
};

export type Binding = {
  object: string;
  business: string;
  store: string;
  place: string;
};

export type HouseRule = {
  name: string;
  rule: string;
};

export type Settings = {
  spec: string;
  timeZone?: string;
  weekStarts: string;
  keysFile?: string;
  backups?: string;
  sites: Site[];
  stores: Store[];
  bindings: Binding[];
  houseRules: HouseRule[];
};

export type SettingsResult = {
  settings: Settings;
  problems: string[];
};
