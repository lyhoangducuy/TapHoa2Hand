import { io } from 'socket.io-client';
import { CONFIG } from '../configurations/configuration';
import { getToken } from './localstorageService';

let socket;

export const initiateSocketConnection = (token) => {
    // Chỉ khởi tạo kết nối nếu chưa có
    if (!socket) {
        socket = io(CONFIG.SOCKET_URL, {
            query: {
                token: token
            },
            transports: ['websocket', 'polling'] // Ưu tiên websocket
        });

        socket.on('connect', () => {
            console.log('Đã kết nối Socket.IO với ID:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Đã ngắt kết nối Socket.IO');
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null; // Reset lại biến
    }
};

// Hàm dùng để join vào 1 conversation cụ thể (Room)
export const joinConversation = (conversationId) => {
    if (socket) {
        socket.emit('join_conversation', conversationId);
    }
};

// Hàm dùng để leave khỏi conversation
export const leaveConversation = (conversationId) => {
    if (socket) {
        socket.emit('leave_conversation', conversationId);
    }
};

// Lắng nghe sự kiện nhận tin nhắn mới từ Backend
export const subscribeToNewMessages = (callback) => {
    if (!socket) return;
    
    // Đảm bảo không bị lặp listener bằng cách gỡ listener cũ ra trước
    socket.off('receive_new_message');
    socket.on('receive_new_message', (newMessage) => {
        console.log('Đã nhận tin nhắn: ', newMessage);
        callback(newMessage);
    });
};

// Hàm gỡ lắng nghe để dùng trong cleanup của useEffect
export const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off('receive_new_message');
};

export const getSocket = () => socket;

export const subscribeToNotifications = ( callback) => {
    const token = getToken();
    if (!socket && token) {
        initiateSocketConnection(token);
    }
    
    if (socket) {
        
        socket.off("new_notification"); // Tránh lặp listener
        socket.on("new_notification", (data) => {
            console.log("🎉 Nhận được thông báo realtime: ", data);
            callback(data);
        });
    }
};

export const unsubscribeFromNotifications = () => {
    if (socket) {
        socket.off("new_notification");
        // CHỈ TẮT LẮNG NGHE SỰ KIỆN NÀY, TUYỆT ĐỐI KHÔNG GỌI socket.disconnect()
        // Xóa dòng socket.disconnect() ở đây đi nhé!
    }
};