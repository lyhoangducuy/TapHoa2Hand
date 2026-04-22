export const safeParseJSON = (value, fallback = {}) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const getUserIdFromToken = (jwtToken) => {
    try {
        if (!jwtToken) return null;
        const payload = jwtToken.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded?.id || decoded?.userId || decoded?.sub || null;
    } catch {
        return null;
    }
};

export const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
};

export const formatPrice = (price) => {
    if (!price && price !== 0) return 'Thỏa thuận';
    const num = Number(price);
    if (isNaN(num)) return price;
    return num.toLocaleString('vi-VN') + ' đ';
};

export const getSenderId = (msg) => {
    return msg?.sender?.id || msg?.senderId || msg?.userId || msg?.createdBy;
};

export const normalizeMessage = (msg, currentUserId) => {
    const senderId = getSenderId(msg);

    return {
        ...msg,
        me: msg.me ?? String(senderId) === String(currentUserId)
    };
};