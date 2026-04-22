import { useEffect } from 'react';
import {
    initiateSocketConnection,
    disconnectSocket,
    joinConversation,
    leaveConversation,
    subscribeToNewMessages,
    unsubscribeFromMessages
} from '../../services/socketService';

export const useChatSocket = (token, activeChatId, onMessage) => {
    useEffect(() => {
        if (token) initiateSocketConnection(token);
        return () => disconnectSocket();
    }, [token]);

    useEffect(() => {
        if (!activeChatId) return;

        joinConversation(activeChatId);

        subscribeToNewMessages(onMessage);

        return () => {
            leaveConversation(activeChatId);
            unsubscribeFromMessages();
        };
    }, [activeChatId, onMessage]);
};