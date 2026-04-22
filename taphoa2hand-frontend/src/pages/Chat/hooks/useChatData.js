import { useState, useEffect } from 'react';
import { getMyConversations, getChatMessages } from '../../services/chatService';
import { formatTime, normalizeMessage } from '../utils/chatUtils';

export const useChatData = (activeChatId, currentUserId) => {
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            setIsLoading(true);
            const res = await getMyConversations();

            if (res?.result) {
                const formatted = res.result.map((c) => ({
                    id: c.id,
                    name: c.conversationName || 'Khách hàng',
                    avatar: c.conversationAvatar,
                    lastMessage: c.lastMessage,
                    time: formatTime(c.updatedAt || c.createdAt),
                    unread: c.unread || 0,
                    type: c.type?.toLowerCase(),
                    postId: c.postId,
                    postTitle: c.postTitle,
                    postImage: c.postImage,
                    postPrice: c.postPrice,
                    isMyPost: c.isMyPost
                }));

                setChats(formatted);
            }

            setIsLoading(false);
        };

        fetchChats();
    }, []);

    useEffect(() => {
        if (!activeChatId) return;

        const fetchMessages = async () => {
            const res = await getChatMessages(activeChatId);

            if (res?.result) {
                const msgs = res.result
                    .reverse()
                    .map((m) => normalizeMessage(m, currentUserId));

                setMessages(msgs);
            }
        };

        fetchMessages();
    }, [activeChatId]);

    return {
        chats,
        setChats,
        messages,
        setMessages,
        isLoading
    };
};