export const CONFIG = {
    // Vite sử dụng import.meta.env
    API_GATEWAY: import.meta.env.VITE_API_GATEWAY,
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL
};

export const API = {
    LOGIN: "/auth/login",
    MY_INFO: "/user/myInfo",
    // Nếu bạn muốn lấy sẵn cái hàm update user hồi nãy:
    UPDATE_USER: (userId) => `/user/${userId}`,
    REGISTER_USER: "/auth/register",

    GET_POST:"/posts/getAll",
    CODE:"/auth/send-code",
    RECODE:"/auth/re-send-code",
    UPDATE_AVATAR:"/user/update-avatar",
    DETAIL_POST:(postId) => `/posts/${postId}`,
    CREATE_POST:"/posts/create",
    CATEGORY:"/categories/getAll",
    PAYMENT:"/payments/getAll",
    DELETE_POST:(postId) => `/posts/delete/${postId}`,
    ADD_FAVORITE:(postId) => `/favorites/add/${postId}`,
    REMOVE_FAVORITE:(postId) => `/favorites/remove/${postId}`,
    GET_MYFAVORITES:"/favorites/my-favorites",
    CHECK_FAVORITE:(postId) => `/favorites/check/${postId}`,
    EDIT_POST:(postId) => `/posts/edit/${postId}`,
    GET_POST_STATUS:"/post-status/getAll",
    CREATE_CONVERSATION:"/conversations/create",
    GET_CONVERSATIONS:"/conversations/my-chats",
    CREATE_CHATMESSAGE:"/chat-message/create",
    GET_CHATMESSAGE:(conversationId)=>`/chat-message?conversationId=${conversationId}`,
    GET_PURCHASES:"/order/purchases",
    GET_SALES:"/order/sales",
    GET_DETAIL_ORDER: (orderId)=> `order/${orderId}`,
    CREATE_ORDER:"/order",
    SEARCH:"/posts/search"
};