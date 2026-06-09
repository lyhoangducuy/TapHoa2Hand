import { io } from 'socket.io-client';
import { CONFIG } from '../configurations/configuration';
import { getToken } from './localstorageService';

// ==========================================
// SINGLETON STATE
// ==========================================
let socket = null;
let isConnecting = false;
let isConnected = false;

// ==========================================
// CALLBACK REGISTRIES (Pub/Sub Pattern)
// ==========================================
const messageListeners = [];
const notificationListeners = [];
const userStatusListeners = [];

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
// INTERNAL: Dispatch to all registered listeners
// ==========================================
const dispatchToMessageListeners = (data) => {
    const parsed = parseMessageData(data);
    if (!parsed) return;
    console.log(`📡 [socket] Dispatching to ${messageListeners.length} message listener(s)`, parsed.id || parsed);
    messageListeners.forEach(callback => {
        try {
            callback(parsed);
        } catch (e) {
            console.error('Error in message listener:', e);
        }
    });
};

const dispatchToNotificationListeners = (data) => {
    console.log(`📡 [socket] new_notification event received. Listeners: ${notificationListeners.length}`, data);
    notificationListeners.forEach((callback, idx) => {
        try {
            console.log(`  → Calling notification listener[${idx}]`);
            callback(data);
        } catch (e) {
            console.error('Error in notification listener:', e);
        }
    });
};

const dispatchToUserStatusListeners = (data) => {
    console.log(`📡 [socket] user_status event received. Listeners: ${userStatusListeners.length}`, data);
    userStatusListeners.forEach(callback => {
        try {
            callback(data);
        } catch (e) {
            console.error('Error in user status listener:', e);
        }
    });
};

// ==========================================
// SOCKET CONNECTION (Singleton - Only once)
// ==========================================

/**
 * Connect socket - only connects once, returns existing socket if already connected
 */
export const initiateSocketConnection = (token) => {
    // Already connected - just return
    if (socket && isConnected) {
        console.log('[socket] Already connected:', socket.id);
        return socket;
    }

    // Currently connecting - wait
    if (isConnecting) {
        console.log('[socket] Is connecting, waiting...');
        return socket;
    }

    isConnecting = true;
    console.log('[socket] Initiating connection...');

    socket = io(CONFIG.SOCKET_URL, {
        query: { token: token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('✅ [socket] Connected:', socket.id);
        isConnected = true;
        isConnecting = false;
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ [socket] Disconnected:', reason);
        isConnected = false;
    });

    socket.on('connect_error', (error) => {
        console.error('❌ [socket] Connection error:', error);
        isConnecting = false;
    });

    // === GLOBAL MESSAGE LISTENER (Only once!) ===
    socket.on('receive_new_message', (data) => {
        console.log('📩 [socket] receive_new_message:', data.id || data);
        dispatchToMessageListeners(data);
    });

    // === GLOBAL NOTIFICATION LISTENER ===
    socket.on('new_notification', (data) => {
        console.log('🔔 [socket] new_notification event:', data.id || data);
        dispatchToNotificationListeners(data);
    });

    // === USER STATUS LISTENER ===
    socket.on('user_status', (userId, status) => {
        console.log('👤 [socket] user_status:', userId, status);
        dispatchToUserStatusListeners({ userId, status });
    });

    isConnecting = false;
    return socket;
};

/**
 * Connect socket with userId (alias for initiateSocketConnection)
 * Call this early when app loads with user token
 */
export const connectSocket = (token) => {
    return initiateSocketConnection(token);
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
        isConnected = false;
        
        // Clear callback registries
        messageListeners.length = 0;
        notificationListeners.length = 0;
        userStatusListeners.length = 0;
        
        console.log('[socket] Disconnected and cleaned up');
    }
};

// ==========================================
// CONVERSATION ROOM MANAGEMENT
// ==========================================
export const joinConversation = (conversationId) => {
    if (socket && isConnected) {
        socket.emit('join_conversation', conversationId);
        console.log('[socket] Joined conversation:', conversationId);
    }
};

export const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
        socket.emit('leave_conversation', conversationId);
        console.log('[socket] Left conversation:', conversationId);
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
    if (!messageListeners.includes(callback)) {
        messageListeners.push(callback);
        console.log(`📝 [socket] Subscribed to messages. Total: ${messageListeners.length}`);
    }
    
    // Return unsubscribe function
    return () => {
        const index = messageListeners.indexOf(callback);
        if (index > -1) {
            messageListeners.splice(index, 1);
            console.log(`📝 [socket] Unsubscribed from messages. Remaining: ${messageListeners.length}`);
        }
    };
};

/**
 * Remove all message listeners (for cleanup)
 */
export const removeAllMessageListeners = () => {
    console.log(`📝 [socket] Removing all ${messageListeners.length} message listeners`);
    messageListeners.length = 0;
};

// ==========================================
// NOTIFICATION SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to notifications
 * @param {Function} callback
 * @returns {Function} Unsubscribe function — USE THIS for cleanup in useEffect
 */
export const subscribeToNotifications = (callback) => {
    if (!notificationListeners.includes(callback)) {
        notificationListeners.push(callback);
        console.log(`🔔 [socket] Subscribed to notifications. Total: ${notificationListeners.length}`);
    }
    
    // Return unsubscribe function — THIS is the proper cleanup
    return () => {
        const index = notificationListeners.indexOf(callback);
        if (index > -1) {
            notificationListeners.splice(index, 1);
            console.log(`🔔 [socket] Unsubscribed from notifications. Remaining: ${notificationListeners.length}`);
        }
    };
};

/**
 * Remove all notification listeners (emergency cleanup)
 */
export const removeAllNotificationListeners = () => {
    console.log(`🔔 [socket] Removing all ${notificationListeners.length} notification listeners`);
    notificationListeners.length = 0;
};

// ==========================================
// USER STATUS SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to user online/offline status
 * @param {Function} callback - Function to call with { userId, status }
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserStatus = (callback) => {
    if (!userStatusListeners.includes(callback)) {
        userStatusListeners.push(callback);
        console.log(`👤 [socket] Subscribed to user status. Total: ${userStatusListeners.length}`);
    }
    
    return () => {
        const index = userStatusListeners.indexOf(callback);
        if (index > -1) {
            userStatusListeners.splice(index, 1);
            console.log(`👤 [socket] Unsubscribed from user status. Remaining: ${userStatusListeners.length}`);
        }
    };
};

/**
 * Remove all user status listeners (emergency cleanup)
 */
export const removeAllUserStatusListeners = () => {
    console.log(`👤 [socket] Removing all ${userStatusListeners.length} user status listeners`);
    userStatusListeners.length = 0;
};

// ==========================================
// LEGACY UNSUBSCRIBE FUNCTIONS — DEPRECATED
// These are NO-OP stubs kept for source compatibility.
// USE the returned unsubscribe function from subscribe* instead.
// ==========================================
export const unsubscribeFromMessages = () => {
    console.warn('[socket] DEPRECATED: unsubscribeFromMessages is a no-op. Use the unsubscribe function returned by subscribeToNewMessages().');
};

export const unsubscribeFromNotifications = () => {
    console.warn('[socket] DEPRECATED: unsubscribeFromNotifications is a no-op. Use the unsubscribe function returned by subscribeToNotifications().');
};

export const unsubscribeFromUserStatus = () => {
    console.warn('[socket] DEPRECATED: unsubscribeFromUserStatus is a no-op. Use the unsubscribe function returned by subscribeToUserStatus().');
};

// ==========================================
// GETTERS
// ==========================================
export const getSocket = () => socket;

export const isSocketConnected = () => isConnected;

// Debug helper — expose listener counts for debugging
export const getListenerCounts = () => ({
    messages: messageListeners.length,
    notifications: notificationListeners.length,
    userStatus: userStatusListeners.length,
});
