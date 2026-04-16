package vn.edu.husc.taphoa2hand_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.firebase.FirebaseException;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationMessage;

@Service
public class FirebaseMessagingService {
    @Autowired
    private FirebaseMessaging firebaseMessaging;
    public String sendNotificationByToken (NotificationMessage notificationMessage){
        Notification notification=Notification.builder()
            .setTitle(notificationMessage.getTitle())
            .setBody(notificationMessage.getBody())
            .setImage(notificationMessage.getImage())
            .build();
        Message message=Message.builder()
            .setToken(notificationMessage.getRecipientToken())
            .setNotification(notification)
            .putAllData(notificationMessage.getData())
            .build();
        try {
            firebaseMessaging.send(message);
            return "Gui thong bao thanh cong";
        } catch (FirebaseException e) {
            e.printStackTrace();
            return "Gui thong bao that bai";
        }
    }
}
