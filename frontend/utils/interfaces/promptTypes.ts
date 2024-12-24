export interface Element {
    type: "text" | "image" | "link" | "animation" | "loadingImage";
    content: string;
    style: Record<string, any>;
    url: string;
    condition: string;
  }
  
  export interface Group {
    container: Element[];
  }

  export interface Container {
    type: "group";
    container: Element[];
  }
  
  export interface ChatBubble {
    chat_bubbles: Container[];
    options: { text: string; next: string }[];
    next?: string;
  }
  