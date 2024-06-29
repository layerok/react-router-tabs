export type ValidTabMeta = Record<string, unknown>;

export type TabModel<Meta extends ValidTabMeta = ValidTabMeta> = {
  id: string;
  title: string;
  meta: Meta;
};