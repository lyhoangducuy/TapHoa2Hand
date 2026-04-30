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
    GET_POST_TYPE:"/post-type/getAll",
    CREATE_CONVERSATION:"/conversations/create",
    GET_CONVERSATIONS:"/conversations/my-chats",
    CREATE_CHATMESSAGE:"/chat-message/create",
    GET_CHATMESSAGE:(conversationId)=>`/chat-message?conversationId=${conversationId}`,
    GET_PURCHASES:"/order/purchases",
    GET_SALES:"/order/sales",

    SEARCH:"/posts/search",
    //users
    ADMIN_GETUSER:"/admin/users",
    ADMIN_GETINFO:(userId)=>`/admin/users/${userId}`,
    ADMIN_UPDATE_USER:(userId)=>`/admin/users/${userId}/update`,
    ADMIN_UPDATE_AVATAR:(userId)=>`/admin/users/${userId}/update-avatar`,
    ADMIN_DELETE_USER: (userId) => `/admin/users/${userId}/delete`,
    ADMIN_CREATE_USER: "/admin/users/create",

    //posts
    ADMIN_GET_POSTS:"/admin/posts",
    ADMIN_GET_POST_DETAIL:(postId) => `/admin/posts/${postId}`,
    ADMIN_UPDATE_POST:(postId) => `/admin/posts/${postId}/update`,
    ADMIN_DELETE_POST:(postId) => `/admin/posts/${postId}/delete`,
    ADMIN_CREATE_POST:"/admin/posts/create",
    //category
    ADMIN_GET_CATEGORY:"/admin/categories",
    ADMIN_GET_CATEGORY_DETAIL:(categoryId)=>`/admin/categories/${categoryId}`,
    ADMIN_UPDATE_CATEGORY:(categoryId)=>`/admin/categories/${categoryId}/update`,
    ADMIN_DELETE_CATEGORY:(categoryId)=>`/admin/categories/${categoryId}/delete`,
    ADMIN_CREATE_CATEGORY:"/admin/categories/create",

    //banner
    ADMIN_GET_BANNERS:"/admin/banner",
    ADMIN_GET_BANNER_DETAIL:(bannerId)=>`/admin/banner/${bannerId}`,
    ADMIN_UPDATE_BANNER:(bannerId)=>`/admin/banner/${bannerId}`,
    ADMIN_DELETE_BANNER:(bannerId)=>`/admin/banner/${bannerId}`,
    ADMIN_CREATE_BANNER:"/admin/banner",
    GET_BANNERS:"/banners",

    // Notification
    GET_NOTIFICATIONS: (userId) => `/notification/user/${userId}`,
    CREATE_NOTIFICATION: "/notification/create",
    MARK_READ_NOTIFICATION: (id) => `/notification/${id}/read`,
    DELETE_NOTIFICATION: (id) => `/notification/${id}`,
    GET_UNREAD_NOTI_COUNT: (userId) => `/notification/${userId}`,
    GET_CHECK_AI:(postId)=>`/chat-ai/check-product/${postId}`,
    //Order
    GET_DETAIL_ORDER: (orderId)=> `/order/${orderId}`,
    Get_DETAIL_USER:"/order/myOrder",
    CREATE_ORDER:"/order",
    UPDATE_ORDER_STATUS: (orderId) => `/order/${orderId}/status`,
    UPDATE_ORDER_STATUS_POST: "/order/update",
    //
    POST_CHAT_AI:"/chat-ai/chat-with-image",
    GET_MYPOST:"/posts/my-post",

};