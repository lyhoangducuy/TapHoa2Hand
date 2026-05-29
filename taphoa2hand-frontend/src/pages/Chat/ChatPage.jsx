import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import { getMyConversations, getChatMessages, createChatMessage } from '../../services/chatService';
import { createOrder } from '../../services/orderService';
import {
    initiateSocketConnection, disconnectSocket, joinConversation,
    leaveConversation, subscribeToNewMessages, unsubscribeFromMessages
} from '../../services/socketService';

import {
    Sidebar,
    ChatWindow,
    ChatMessages,
    ChatInput,
    OrderModal,
    ChatHeader,
    PinnedProduct
} from './components';

import styles from './ChatPage.module.scss';

const cx = classNames.bind(styles);

// ==========================================
// PURE HELPERS (Đưa ra ngoài để tránh re-render)
// ==========================================
const safeParseJSON = (value, fallback = {}) => {
    try { return JSON.parse(value); } catch { return fallback; }
};

const getUserIdFromToken = (jwtToken) => {
    try {
        if (!jwtToken) return null;
        const payload = jwtToken.split('.')[1];
        if (!payload) return null;
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded?.id || decoded?.userId || decoded?.sub || null;
    } catch { return null; }
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit'
    });
};

// ==========================================
// MAIN COMPONENT
// ==========================================
function ChatPage() {
    const navigate = useNavigate();
    
    // --- 1. STATES ---
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [searchParams] = useSearchParams();
    const urlActiveId = searchParams.get('activeId');
    const [activeChatId, setActiveChatId] = useState(urlActiveId || null);

    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const initialOrderForm = {
        sellerId: '',
        buyerId: '',
        postId: '',
        method: 'MIDDLEMAN',
        receiverName: '',
        receiverPhone: '',
        shippingProvinceCode: '',
        shippingProvinceName: '',
        shippingWardCode: '',
        shippingWardName: '',
        shippingAddress: '',
        holdDurationUnit: 'DAYS',
        holdDurationAmount: 3,
        offeredPrice: '',
        buyerBank: {
            bankName: '',
            accountName: '',
            accountNumber: ''
        }
    };

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [orderForm, setOrderForm] = useState(initialOrderForm);

    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');
    
    const currentUser = safeParseJSON(localStorage.getItem('user') || '{}', {});
    const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.sub || getUserIdFromToken(token);

    const currentChat = chats.find((c) => String(c.id) === String(activeChatId));

    const normalizeMessage = (msg) => ({
        ...msg,
        me: msg.me ?? false
    });

    // --- 2. EFFECTS ---
    useEffect(() => {
        if (urlActiveId) setActiveChatId(urlActiveId);
    }, [urlActiveId]);

    useEffect(() => {
        if (token) initiateSocketConnection(token);
        return () => disconnectSocket();
    }, [token]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                setIsLoading(true);
                const response = await getMyConversations();
                if (response && response.result) {
                    const formattedChats = response.result.map((conv) => ({
                        id: conv.id,
                        name: conv.conversationName || 'Khách hàng',
                        avatar: conv.conversationAvatar,
                        lastMessage: conv.lastMessage || 'Đã kết nối...',
                        time: formatTime(conv.updatedAt || conv.createdAt),
                        unread: conv.unread || 0,
                        type: conv.type?.toLowerCase() || 'selling',
                        postId: conv.postId,
                        postTitle: conv.postTitle,
                        postImage: conv.postImage,
                        postPrice: conv.postPrice,
                        postType: conv.postType,
                        postStatus: conv.postStatus,
                        isMyPost: conv.isMyPost
                    }));
                    setChats(formattedChats);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách đoạn chat:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChats();
    }, []);

    useEffect(() => {
        if (!activeChatId) return;

        const fetchMessages = async () => {
            try {
                const response = await getChatMessages(activeChatId);
                if (response.code === 1000 && response.result) {
                    setMessages(response.result.reverse().map(normalizeMessage));
                    setChats((prevChats) => prevChats.map((chat) =>
                        String(chat.id) === String(activeChatId) ? { ...chat, unread: 0 } : chat
                    ));
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách tin nhắn:', error);
            }
        };

        fetchMessages();
        joinConversation(activeChatId);

        subscribeToNewMessages((newMessage) => {
            try {
                const parsedMessage = typeof newMessage === 'string' ? JSON.parse(newMessage) : newMessage;
                const normalizedMessage = normalizeMessage(parsedMessage);
                const isCurrentChat = String(normalizedMessage.conversationId) === String(activeChatId);

                if (isCurrentChat) {
                    setMessages((prev) => {
                        const existingIndex = prev.findIndex((m) => String(m.id) === String(normalizedMessage.id));
                        if (existingIndex !== -1) {
                            const next = [...prev];
                            next[existingIndex] = { ...next[existingIndex], ...normalizedMessage };
                            return next;
                        }
                        return [...prev, normalizedMessage];
                    });
                }

                setChats((prevChats) => prevChats.map((chat) =>
                    String(chat.id) === String(normalizedMessage.conversationId)
                        ? {
                              ...chat,
                              lastMessage: normalizedMessage.message || chat.lastMessage,
                              time: formatTime(normalizedMessage.createdDate || normalizedMessage.createdAt || Date.now()),
                              unread: isCurrentChat ? 0 : (chat.unread || 0) + 1
                          }
                        : chat
                ));
            } catch (error) {
                console.error('Lỗi khi parse dữ liệu socket:', error);
            }
        });

        return () => {
            leaveConversation(activeChatId);
            unsubscribeFromMessages();
        };
    }, [activeChatId, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- 3. HANDLERS ---
    const handleChatSelect = (chatId) => {
        setActiveChatId(chatId);
        setChats((prev) => prev.map((chat) => String(chat.id) === String(chatId) ? { ...chat, unread: 0 } : chat));
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    const handleSendMessage = async () => {
        if ((!messageInput.trim() && !selectedFile) || !activeChatId || isSending) return;
        const trimmedMessage = messageInput.trim();
        setMessageInput('');
        setIsSending(true);

        try {
            const formData = new FormData();
            formData.append('conversationId', activeChatId);
            formData.append('message', trimmedMessage || '');
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await createChatMessage(formData);
            if (response.code === 1000 && response.result) {
                setSelectedFile(null);
                const newlySentMessage = normalizeMessage({ ...response.result, me: true });
                setMessages((prev) => {
                    const existingIndex = prev.findIndex((m) => String(m.id) === String(newlySentMessage.id));
                    if (existingIndex !== -1) {
                        const next = [...prev];
                        next[existingIndex] = { ...next[existingIndex], ...newlySentMessage };
                        return next;
                    }
                    return [...prev, newlySentMessage];
                });

                setChats((prev) => prev.map((chat) =>
                    String(chat.id) === String(activeChatId)
                        ? { ...chat, lastMessage: newlySentMessage.message || (selectedFile ? '📎 Đã gửi tệp đính kèm' : newlySentMessage.message), time: formatTime(newlySentMessage.createdDate || newlySentMessage.createdAt), unread: 0 }
                        : chat
                ));
            }
        } catch (error) {
            toast.error('Gửi tin nhắn thất bại!');
        } finally {
            setIsSending(false);
        }
    };

    const handleOrderFormChange = (e) => {
        const { name, value } = e.target ? e.target : e;
        if (name.startsWith('buyerBank.')) {
            const field = name.split('.')[1];
            let next = value;
            if (field === 'accountNumber') {
                next = value.replace(/\D/g, '');
            } else if (field === 'bankName' || field === 'accountName') {
                next = value.replace(/\p{Nd}/gu, '');
            }
            setOrderForm((prev) => ({
                ...prev,
                buyerBank: {
                    ...prev.buyerBank,
                    [field]: next,
                },
            }));
            return;
        }

        if (name === 'receiverPhone') {
            setOrderForm((prev) => ({
                ...prev,
                receiverPhone: value.replace(/\D/g, ''),
            }));
            return;
        }

        if (name === 'receiverName') {
            setOrderForm((prev) => ({
                ...prev,
                receiverName: value.replace(/\p{Nd}/gu, ''),
            }));
            return;
        }

        if (name === 'method') {
            setOrderForm((prev) => ({
                ...prev,
                method: value,
                buyerBank: initialOrderForm.buyerBank,
                holdDurationUnit: initialOrderForm.holdDurationUnit,
                holdDurationAmount: initialOrderForm.holdDurationAmount
            }));
            return;
        }

        if (name === 'holdDurationAmount') {
            const digits = value.replace(/\D/g, '');
            if (digits === '') {
                setOrderForm((prev) => ({
                    ...prev,
                    holdDurationAmount: '',
                }));
                return;
            }
            const parsed = parseInt(digits, 10);
            setOrderForm((prev) => ({
                ...prev,
                holdDurationAmount: Number.isNaN(parsed) ? '' : parsed,
            }));
            return;
        }

        if (name === 'offeredPrice') {
            const cleaned = value.replace(/[^\d]/g, '');
            setOrderForm((prev) => ({
                ...prev,
                offeredPrice: cleaned
            }));
            return;
        }

        if (name === 'price') {
            const cleaned = value.replace(/[^\d]/g, '');
            setOrderForm((prev) => ({
                ...prev,
                offeredPrice: cleaned
            }));
            return;
        }

        setOrderForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const openOrderModal = () => {
        setOrderForm(initialOrderForm);
        setCreatedOrder(null);
        setIsOrderModalOpen(true);
    };

    const submitOrderRequest = async (e) => {
        e.preventDefault();

        const receiverName = orderForm.receiverName?.trim() ?? '';
        const receiverPhone = orderForm.receiverPhone?.trim() ?? '';
        const provinceName = orderForm.shippingProvinceName?.trim() ?? '';
        const provinceCode = String(orderForm.shippingProvinceCode ?? '').trim();
        const wardName = orderForm.shippingWardName?.trim() ?? '';
        const wardCode = String(orderForm.shippingWardCode ?? '').trim();
        const lineDetail = orderForm.shippingAddress?.trim() ?? '';

        if (!receiverName || !receiverPhone || !lineDetail) {
            toast.warning('Vui lòng điền đủ thông tin nhận hàng!');
            return;
        }
        if (!provinceName || !provinceCode) {
            toast.warning('Vui lòng chọn Tỉnh/Thành phố.');
            return;
        }
        if (!wardName || !wardCode) {
            toast.warning('Vui lòng chọn Phường/Xã.');
            return;
        }
        const shippingAddress = [lineDetail, wardName, provinceName].filter(Boolean).join(', ');
        if (/\p{Nd}/u.test(receiverName)) {
            toast.warning('Tên người nhận không được chứa chữ số');
            return;
        }
        if (!/^\d{8,15}$/.test(receiverPhone)) {
            toast.warning('Số điện thoại chỉ được nhập chữ số (8–15 số)');
            return;
        }

        if (orderForm.method === 'MIDDLEMAN') {
            const bankName = orderForm.buyerBank.bankName?.trim() ?? '';
            const accountName = orderForm.buyerBank.accountName?.trim() ?? '';
            const accountNumber = orderForm.buyerBank.accountNumber?.trim() ?? '';
            if (!bankName || !accountName || !accountNumber) {
                toast.warning('Vui lòng điền đầy đủ thông tin tài khoản ngân hàng cho giao dịch trung gian!');
                return;
            }
            if (/\p{Nd}/u.test(bankName)) {
                toast.warning('Tên ngân hàng không được chứa chữ số');
                return;
            }
            if (/\p{Nd}/u.test(accountName)) {
                toast.warning('Họ tên chủ tài khoản không được chứa chữ số');
                return;
            }
            if (!/^\d+$/.test(accountNumber)) {
                toast.warning('Số tài khoản chỉ được nhập chữ số (0–9)');
                return;
            }
            const holdAmt = Number(orderForm.holdDurationAmount);
            const maxHold = orderForm.holdDurationUnit === 'HOURS' ? 240 : 10;
            if (!holdAmt || holdAmt < 1 || holdAmt > maxHold) {
                toast.warning(
                    orderForm.holdDurationUnit === 'HOURS'
                        ? 'Thời gian giữ tiền: nhập từ 1 đến 240 giờ (tối đa 10 ngày).'
                        : 'Thời gian giữ tiền: nhập từ 1 đến 10 ngày.'
                );
                return;
            }
        }

        const isBuyPost = String(currentChat?.postType || '').toUpperCase() === 'BUY';
        if (isBuyPost) {
            const offered = Number(orderForm.offeredPrice);
            if (!orderForm.offeredPrice || !Number.isFinite(offered) || offered <= 0) {
                toast.warning('Vui lòng nhập giá đề xuất (VNĐ) cho tin cần mua.');
                return;
            }
        }

        setIsSubmittingOrder(true);

        try {
            const isBuyPost = String(currentChat?.postType || '').toUpperCase() === 'BUY';
            const payload = {
                sellerId: String(currentChat?.userId || currentChat?.id || ''), 
                buyerId: String(currentUserId), 
                postId: String(currentChat?.postId || ''),
                method: orderForm.method,
                receiverName,
                receiverPhone,
                shippingAddress,
                buyerBank:
                    orderForm.method === 'MIDDLEMAN'
                        ? {
                              bankName: orderForm.buyerBank.bankName.trim(),
                              accountName: orderForm.buyerBank.accountName.trim(),
                              accountNumber: orderForm.buyerBank.accountNumber.trim(),
                          }
                        : undefined,
                holdDurationUnit: orderForm.method === 'MIDDLEMAN' ? orderForm.holdDurationUnit : undefined,
                holdDurationAmount: orderForm.method === 'MIDDLEMAN' ? Number(orderForm.holdDurationAmount) : undefined,
                ...(isBuyPost ? { offeredPrice: Number(orderForm.offeredPrice) } : {})
            };

            const res = await createOrder(payload);

            if (res.code === 1000 || res.message === 'Tao order thanh cong') {
                    const newOrder = res.result || payload;
                    toast.success('Tạo đơn hàng thành công! Vui lòng thanh toán trong 180 phút.');
                    setCreatedOrder(newOrder);
                    setIsOrderModalOpen(false);
                    navigate(`/order/myOrder?tab=purchases&orderId=${newOrder.id}`);
                // Gửi tin nhắn tự động
                const autoMessage =
                    'Tôi đã gửi yêu cầu giao dịch cho sản phẩm này qua hệ thống. Vui lòng kiểm tra!';

                try {
                    await createChatMessage({
                        conversationId: activeChatId,
                        message: autoMessage
                    });
                } catch (err) {
                    console.error('Lỗi gửi tin nhắn tự động:', err);
                }
            } else {
                toast.error('Có lỗi xảy ra: ' + (res.message || 'Không xác định'));
            }
        } catch (error) {
            console.error('Lỗi tạo order:', error);
            toast.error('Không thể tạo đơn hàng, thử lại sau!');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const filteredChats = chats.filter((chat) => {
        const matchSearch = chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) || chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchSearch) return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return chat.unread > 0;
        return chat.type === activeTab;
    });

    // --- 4. RENDER UI TỔNG ---
    return (
        <div className={cx('chat-layout')}>
            <Sidebar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery}
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                isLoading={isLoading} 
                filteredChats={filteredChats}
                activeChatId={activeChatId} 
                handleChatSelect={handleChatSelect}
            />
            
            <ChatWindow 
                activeChatId={activeChatId} 
                currentChat={currentChat}
            >
                <ChatHeader 
                    currentChat={currentChat} 
                    onOpenOrderModal={openOrderModal}
                />
                
                <PinnedProduct 
                    currentChat={currentChat} 
                    onOpenOrderModal={openOrderModal}
                />
                
                <ChatMessages 
                    messages={messages} 
                    currentUserId={currentUserId}
                    messagesEndRef={messagesEndRef} 
                />
                
                <ChatInput 
                    messageInput={messageInput}
                    setMessageInput={setMessageInput} 
                    isSending={isSending}
                    onSendMessage={handleSendMessage}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    onFileSelect={handleFileSelect}
                />
            </ChatWindow>

            {isOrderModalOpen && (
                <OrderModal 
                    currentChat={currentChat} 
                    orderForm={orderForm}
                    setOrderForm={setOrderForm}
                    submitOrderRequest={submitOrderRequest}
                    handleOrderFormChange={handleOrderFormChange}
                    isSubmittingOrder={isSubmittingOrder} 
                    createdOrder={createdOrder}
                    onCheckout={() => navigate(`/order/myOrder?orderId=${createdOrder?.id}`)}
                    close={() => {
                        setIsOrderModalOpen(false);
                        setCreatedOrder(null);
                        setOrderForm(initialOrderForm);
                    }}
                />
            )}
        </div>
    );
}

export default ChatPage;