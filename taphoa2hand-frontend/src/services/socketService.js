import { io } from 'socket.io-client'; // <-- DÒNG BỊ THIẾU LÀ DÒNG NÀY ĐÂY
import { CONFIG } from '../configurations/configuration';

let socket;

export const initiateSocketConnection = (token) => {
    // Chỉ khởi tạo kết nối nếu chưa có
    if (!socket) {
        socket = io(CONFIG.SOCKET_URL, {
            // Có thể truyền token để Backend xác thực (nếu Backend có cài đặt)
            auth: {
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
        console.log('Đã nhan tin nhan: ',newMessage);
        callback(newMessage);
    });
};

export const getSocket = () => socket;