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
    ADMIN_DASHBOARD_STATS: "/admin/dashboard",
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
    GET_MYPOST: "/posts/my-post",
    GET_USER_POSTS: (userId) => `/posts/user/${userId}`,
    GET_POST_STATUS:"/post-status/getAll",
    GET_POST_TYPE:"/post-type/getAll",
    CREATE_CONVERSATION:"/conversations/create",
    GET_CONVERSATIONS:"/conversations/my-chats",
    CREATE_CHATMESSAGE:"/chat-message/create",
    GET_CHATMESSAGE:(conversationId)=>`/chat-message?conversationId=${conversationId}`,
    GET_PURCHASES:"/order/purchases",
    GET_SALES:"/order/sales",

    SEARCH:"/posts/search",
    SELLING_POSTS:"/posts/selling",
    BUYING_POSTS:"/posts/buying",
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
    ADMIN_GET_ORDERS:"/order/admin",
    ORDER_CONFIRM_PAYMENT: (orderId) => `/order/${orderId}/confirm-payment`,
    ORDER_ADMIN_ESCROW_PAYOUT: (orderId) => `/order/${orderId}/admin-escrow-payout`,
    GET_BANNERS:"/banners",

    REPORT_SUBMIT_USER: "/reports/submit/user",
    REPORT_SUBMIT_POST: "/reports/submit/post",
    REPORT_SUBMIT_ORDER: "/reports/submit/order",
    ADMIN_GET_ALL_REPORTS: "/reports",
    ADMIN_GET_REPORT_BY_ID: (reportId) => `/reports/${reportId}`,
    ADMIN_GET_REPORTS_BY_STATUS: (status) => `/reports/status/${status}`,
    ADMIN_UPDATE_REPORT_STATUS: (reportId) => `/reports/${reportId}/status`,
    ADMIN_REVIEW_REPORT: (reportId) => `/reports/${reportId}/review`,
    ADMIN_REPORTS_PAGED: `/reports/paged`,
    ADMIN_REPORTS_STATS: `/reports/stats`,
    GET_MY_REPORTS_PAGED: `/reports/my-reports/paged`,

    // Notification
    GET_NOTIFICATIONS: (userId) => `/notification/user/${userId}`,
    CREATE_NOTIFICATION: "/notification/create",
    MARK_READ_NOTIFICATION: (id) => `/notification/${id}/read`,
    DELETE_NOTIFICATION: (id) => `/notification/${id}`,
    GET_UNREAD_NOTI_COUNT: (userId) => `/notification/${userId}`,
    GET_CHECK_AI:(postId)=>`/chat-ai/check-product/${postId}`,
    /** Danh mục địa giới (proxy backend → provinces.open-api.vn) */
    GET_LOCATION_PROVINCES: "/location/provinces",
    GET_LOCATION_WARDS_BY_PROVINCE: (provinceCode) =>
        `/location/provinces/${encodeURIComponent(provinceCode)}/wards`,
    //Order
    GET_DETAIL_ORDER: (orderId)=> `/order/${orderId}`,
    Get_DETAIL_USER:"/order/myOrder",
    CREATE_ORDER:"/order",
    UPDATE_ORDER_STATUS: (orderId) => `/order/${orderId}/status`,
    UPDATE_ORDER_STATUS_POST: "/order/update",
    COUNT_ORDER_OF_POST: (postId) => `/order/count/${postId}`,
    COUNT_COMPLETED_ORDERS: `/order/count-completed`,
    //
    POST_CHAT_AI:"/chat-ai/chat-with-image",
    //Feedback
    CREATE_FEEDBACK:"/api/feedbacks/create",
    GET_FEEDBACK_BY_ORDER:(orderId)=>`/api/feedbacks/order/${orderId}`,
    GET_FEEDBACK_BY_USER:(userId)=>`/api/feedbacks/user/${userId}`,
    GET_FEEDBACK_BY_REVIEWER:(userId)=>`/api/feedbacks/reviewer/${userId}`,
    GET_AVERAGE_RATING:(userId)=>`/api/feedbacks/rating/${userId}`,
    COUNT_FEEDBACK:(userId)=>`/api/feedbacks/count/${userId}`,
    GET_FEEDBACKS_FOR_PROFILE:(userId)=>`/api/feedbacks/profile/${userId}`,
    UPDATE_FEEDBACK:(feedbackId)=>`/api/feedbacks/${feedbackId}`,
    DELETE_FEEDBACK:(feedbackId)=>`/api/feedbacks/${feedbackId}`,
    ADMIN_GET_ALL_FEEDBACKS:"/api/feedbacks/admin",
    ADMIN_DELETE_FEEDBACK:(feedbackId)=>`/api/feedbacks/admin/${feedbackId}`,
    ADMIN_UPDATE_FEEDBACK:(feedbackId)=>`/api/feedbacks/admin/${feedbackId}`,
    ADMIN_GET_FEEDBACKS_BY_USER:(userId)=>`/api/feedbacks/admin/user/${userId}`,
    FEEDBACK_AVG_RATING: (userId) => `/api/feedbacks/average/${userId}`,
    FEEDBACK_WITH_ORDER_POST: (userId) => `/api/feedbacks/full/${userId}`,

    // Reports - by type
    ADMIN_GET_USER_REPORTS: "/reports/type/user",
    ADMIN_GET_USER_REPORTS_PAGED: "/reports/type/user/paged",
    ADMIN_GET_ORDER_REPORTS: "/reports/type/order",
    ADMIN_GET_ORDER_REPORTS_PAGED: "/reports/type/order/paged",
    ADMIN_GET_POST_REPORTS: "/reports/type/post",
    ADMIN_GET_POST_REPORTS_PAGED: "/reports/type/post/paged",
};