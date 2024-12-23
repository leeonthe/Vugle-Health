export interface Element {
    type: "text" | "image" | "link";
    content: string;
    style?: Record<string, any>;
    url?: string;
  }
  
  export interface Container {
    container: Element[];
  }
  
  export interface ChatBubble {
    chat_bubbles: Container[];
    options: { text: string; next: string }[];
    next?: string;
  }
  