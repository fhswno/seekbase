export type EmojiEntry = {
  emoji: string;
  keywords: string;
};

export type EmojiCategory = {
  name: string;
  emojis: EmojiEntry[];
};
