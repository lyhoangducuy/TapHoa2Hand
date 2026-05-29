import { io } from 'socket.io-client';
import { CONFIG } from '../configurations/configuration';
import { getToken } from './localstorageService';

let socket = null;
let isConnecting = false;

// ==========================================
// CALLBACK REGISTRIES (Pub/Sub Pattern)
// ==========================================
const messageCallbacks = new Set();
const notificationCallbacks = new Set();
const userStatusCallbacks = new Set();

// ==========================================
// UTILITY: Parse message data
// ==========================================
const parseMessageData = (data) => {
    if (!data) return null;
    try {
        if (typeof data === 'string') {
            return JSON.parse(data);
        }
        return data;
    } catch (e) {
        console.error('Error parsing message data:', e);
        return null;
    }
};

// ==========================================
// INTERNAL: Dispatch to all registered callbacks
// ==========================================
const dispatchToMessageCallbacks = (data) => {
    const parsed = parseMessageData(data);
    if (!parsed) return;
    messageCallbacks.forEach(callback => {
        try {
            callback(parsed);
        } catch (e) {
            console.error('Error in message callback:', e);
        }
    });
};

const dispatchToNotificationCallbacks = (data) => {
    notificationCallbacks.forEach(callback => {
        try {
            callback(data);
        } catch (e) {
            console.error('Error in notification callback:', e);
        }
    });
};

const dispatchToUserStatusCallbacks = (data) => {
    userStatusCallbacks.forEach(callback => {
        try {
            callback(data);
        } catch (e) {
            console.error('Error in user status callback:', e);
        }
    });
};

// ==========================================
// SOCKET INITIALIZATION (Singleton)
// ==========================================
export const initiateSocketConnection = (token) => {
    // Nếu đã có socket và đang connect rồi thì return
    if (socket && socket.connected) {
        return socket;
    }

    // Nếu đang trong quá trình connect thì đợi
    if (isConnecting) {
        return socket;
    }

    isConnecting = true;

    socket = io(CONFIG.SOCKET_URL, {
        query: { token: token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        isConnecting = false;
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        isConnecting = false;
    });

    // === GLOBAL MESSAGE LISTENER ===
    socket.on('receive_new_message', (data) => {
        console.log('📩 Socket receive_new_message:', data);
        dispatchToMessageCallbacks(data);
    });

    // === GLOBAL NOTIFICATION LISTENER ===
    socket.on('new_notification', (data) => {
        console.log('🔔 Socket new_notification:', data);
        dispatchToNotificationCallbacks(data);
    });

    // === USER STATUS LISTENER ===
    socket.on('user_status', (userId, status) => {
        console.log('👤 Socket user_status:', userId, status);
        dispatchToUserStatusCallbacks({ userId, status });
    });

    isConnecting = false;
    return socket;
};

// ==========================================
// DISCONNECT
// ==========================================
export const disconnectSocket = () => {
    if (socket) {
        // Clear all listeners from socket
        socket.removeAllListeners('receive_new_message');
        socket.removeAllListeners('new_notification');
        socket.removeAllListeners('user_status');
        socket.removeAllListeners('connect');
        socket.removeAllListeners('disconnect');
        
        socket.disconnect();
        socket = null;
        
        // Clear callback registries
        messageCallbacks.clear();
        notificationCallbacks.clear();
        userStatusCallbacks.clear();
        
        console.log('Socket disconnected and cleaned up');
    }
};

// ==========================================
// CONVERSATION ROOM MANAGEMENT
// ==========================================
export const joinConversation = (conversationId) => {
    if (socket && socket.connected) {
        socket.emit('join_conversation', conversationId);
        console.log('Joined conversation:', conversationId);
    }
};

export const leaveConversation = (conversationId) => {
    if (socket && socket.connected) {
        socket.emit('leave_conversation', conversationId);
        console.log('Left conversation:', conversationId);
    }
};

// ==========================================
// MESSAGE SUBSCRIPTIONS (Pub/Sub)
// ==========================================

/**
 * Subscribe to new chat messages
 * @param {Function} callback - Function to call when a new message arrives
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNewMessages = (callback) => {
    messageCallbacks.add(callback);
    console.log('Subscribed to new messages. Total:', messageCallbacks.size);
    
    // Return unsubscribe function
    return () => {
        messageCallbacks.delete(callback);
        console.log('Unsubscribed from new messages. Total:', messageCallbacks.size);
    };
};

/**
 * Unsubscribe specific callback from messages
 */
export const unsubscribeFromMessages = (callback) => {
    if (callback) {
        messageCallbacks.delete(callback);
    }
};

/**
 * Subscribe to notifications
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = (callback) => {
    notificationCallbacks.add(callback);
    
    return () => {
        notificationCallbacks.delete(callback);
    };
};

/**
 * Unsubscribe specific callback from notifications
 */
export const unsubscribeFromNotifications = (callback) => {
    if (callback) {
        notificationCallbacks.delete(callback);
    }
};

// ==========================================
// USER STATUS SUBSCRIPTIONS (Pub/Sub)
// ==========================================

/**
 * Subscribe to user online/offline status
 * @param {Function} callback - Function to call with { userId, status }
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserStatus = (callback) => {
    userStatusCallbacks.add(callback);
    console.log('Subscribed to user status. Total:', userStatusCallbacks.size);
    
    return () => {
        userStatusCallbacks.delete(callback);
        console.log('Unsubscribed from user status. Total:', userStatusCallbacks.size);
    };
};

/**
 * Unsubscribe specific callback from user status
 */
export const unsubscribeFromUserStatus = (callback) => {
    if (callback) {
        userStatusCallbacks.delete(callback);
    }
};

// ==========================================
// GETTERS
// ==========================================
export const getSocket = () => socket;

export const isSocketConnected = () => socket && socket.connected;
