import { ChatBubble } from "../../../utils/interfaces/promptTypes";

export type ChatHistoryAction =
  | { type: "ADD_USER_RESPONSE"; payload: ChatBubble }
  | { type: "ADD_LOADING_MESSAGE"; payload: ChatBubble }
  | { type: "REMOVE_LOADING_MESSAGE"; payload: number }
  | { type: "ADD_PROMPT_DATA"; payload: ChatBubble }
  | { type: "SET_ACTION_TRIGGERED"; payload: boolean };

export const chatHistoryReducer = (state: { chatHistory: ChatBubble[]; actionTriggered: boolean }, action: ChatHistoryAction) => {
  switch (action.type) {
    case "ADD_USER_RESPONSE":
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case "ADD_LOADING_MESSAGE":
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case "REMOVE_LOADING_MESSAGE":
      return { ...state, chatHistory: state.chatHistory.filter((chat) => chat.chat_bubbles_id !== action.payload) };
    case "ADD_PROMPT_DATA":
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case "SET_ACTION_TRIGGERED":
      return { ...state, actionTriggered: action.payload };
    default:
      return state;
  }
};
