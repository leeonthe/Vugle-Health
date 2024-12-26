export interface BaseElement {
  type: "text" | "image" | "link" | "animation" | "loadingImage";
  content: string;
  style?: Record<string, any>;
  url?: string;
  condition?: string;
}

export interface GroupElement {
  type: "group";
  content: BaseElement[];
}

export type Element = BaseElement | GroupElement;

export interface Container {
  container: Element[];
}

export interface ChatBubble {
  chat_bubbles_id: number;
  chat_bubbles: Container[];
  options_id: number;
  options: { text: string; next: string }[];
  next?: string;
}
