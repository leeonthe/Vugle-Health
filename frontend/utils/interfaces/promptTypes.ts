export interface BaseElement {
  type: "text" | "image" | "link" | "animation" | "loadingImage";
  content: string;
  style?: Record<string, any>;
  url?: string;
  condition?: string;
}

export interface GroupElement {
  type: "group";
  content: BaseElement[]; // Group contains an array of elements
}

export type Element = BaseElement | GroupElement;

export interface Container {
  container: Element[];
}

export interface ChatBubble {
  chat_bubbles: Container[];
  options: { text: string; next: string }[];
  next?: string;
}
