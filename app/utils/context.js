import { createContext, useContext } from "react";

export const IndexContext = createContext(null);
export const DisplayDirectoryContext = createContext(null);
export const displayIconContext = createContext(null);
export const uploadCardContext = createContext(null);

// Web socket
const socket = new WebSocket('ws://fileSync.home:3030');
export const wsContext = createContext(socket);