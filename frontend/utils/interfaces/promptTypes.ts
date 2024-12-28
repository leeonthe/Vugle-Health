/**
 * @interface BaseElement
 * Represents the basic structure of chatbot prompt. Each element defines its type (e.g., text, image, link),
 * its content, and optional attributes such as style, URL, or a condition for conditional rendering.
 
 - `type`: The kind of element (e.g., "text", "image", "link", etc.).
 - `content`: The content of the element (e.g., text or image URL).
 - `style` (optional): Custom styles applied to the element.
 - `url` (optional): URL for "link" type elements.
 - `condition` (optional): A condition to control whether the element is displayed.
 */
export interface BaseElement {
  type: "text" | "image" | "link" | "animation" | "loadingImage";
  content: string;
  style?: Record<string, any>;
  url?: string;
  condition?: string;
}

/**
 * @interface GroupElement
 * Represents a group of multiple `BaseElement` objects bundled together.
 
 - `type`: Always "group" to signify it contains grouped elements.
 - `content`: An array of `BaseElement` objects that make up the group.
 */
export interface GroupElement {
  type: "group";
  content: BaseElement[];
}

/**
 * @interface CustomElement
 * Represents a custom React component or UI element for special use cases. Used in displaying loading message (...)
 
 - `type`: Always "custom".
 - `content`: A `React.ReactNode` (this is to apply animations or dynamic UI components).
 */
export interface CustomElement {
  type: "custom";
  content: React.ReactNode; 
}

/**
 * @type Element
 * A union type that represents any valid chat element. It can be a `BaseElement`, a `GroupElement`, or a `CustomElement`.
 * Ensures flexibility in defining various types of elements within the chat interface.
 */
export type Element = BaseElement | GroupElement | CustomElement;

/**
 * @interface Container
 * Groups one or more `Element` objects together in a container. 
 * This is used to organize chat elements (e.g., [Image: logo], [Prompt: text...]) into distinct chat containers or bubbles 💬.
 
 - `container`: An array of `Element` objects, representing individual UI components like text, images, or custom content.
 */
export interface Container {
  container: Element[];
}

/**
 * @interface ChatBubble 💬
 * Represents the structured .json format for defining chatbot prompts and option choices.
 * Encapsulates all elements (e.g., text, images, animations) and options corresponding to a specific step in the chat interaction flow.

 - `chat_bubbles_id`: Unique ID for chat bubble in the conversation.
 - `chat_bubbles`: Array of `Container` objects, each containing the elements to be rendered.
 - `options_id`: Unique identifier for the options associated with this chat bubble.
 - `options`:  An array of selectable options for the user. Each option contains:
    - `text`: A label representing the choice, or a unique identifier for options requiring special input (e.g., text input fields).
    - `inputType` (optional): Specifies the type of user input required for certain options, typically for options that need to POST data to the backend.
                            + NOTE: This property only appears in .json files where the text value is "TYPE".
    - `next`: Specifies the next prompt in the chat flow when this option is selected.
 - `next` (optional): An identifier for the next step in the chat flow (used for automatic transitions).
 - `userResponse` (optional): Stores the user's response for this specific step in the chat interaction.
 */
export interface ChatBubble {
  chat_bubbles_id: number;
  chat_bubbles: Container[];
  options_id: number;
  options: { text: string; inputType?: string; next: string }[];
  next?: string;
  userResponse?: string;
}