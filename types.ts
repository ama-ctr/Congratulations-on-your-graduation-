
export interface Hint {
  text: string;
  emoji: string;
}

export interface PolishedResult {
  long: string;
  short: string;
}

export interface FormState {
  who: string;
  what: string;
  feeling: string;
  otherFeeling: string;
  future: string;
  finalText: string;
  shortText: string;
}

export type Emotion = 'かっこよかった' | 'やさしかった' | 'あこがれだった' | 'さびしくなるよ' | '';
