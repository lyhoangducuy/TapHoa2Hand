Tuyệt vời! Dự án đã lên hình lên dáng rồi, giờ viết một cái `README.md` xịn sò để lỡ sau này ông (hoặc team của ông) clone về máy khác còn biết đường mà chạy, không lại ngồi mò mẫm lỗi môi trường thì trầm cảm lắm. 

Tôi viết sẵn cho ông một template `README.md` chuẩn bài, bao gồm cả Frontend (React) và Backend (Spring Boot). Ông chỉ cần copy toàn bộ đoạn dưới đây, tạo file `README.md` ở thư mục gốc của dự án và dán vào là xong:

---

```markdown
# 🛒 Tạp Hóa 2Hand - E-commerce Platform

Dự án website thương mại điện tử "Tạp Hóa 2Hand" bao gồm Frontend (ReactJS) và Backend (Java Spring Boot).

## 🚀 1. Yêu cầu hệ thống (Prerequisites)

Để chạy được dự án này, máy tính của bạn cần cài đặt sẵn các phần mềm sau:
* **Java:** JDK 21 hoặc mới hơn.
* **Node.js:** Phiên bản 16.x hoặc 18.x trở lên (kèm npm).
* **Database:** MariaDb 
* **Redis:** BẮT BUỘC CÓ để xử lý cache và lưu trữ mã OTP đăng ký.
* **IDE khuyên dùng:** IntelliJ IDEA (cho Backend) và Visual Studio Code (cho Frontend).

---

## ⚙️ 2. Hướng dẫn khởi chạy Backend (Spring Boot)

**Bước 1: Mở dự án**
Mở thư mục chứa code Backend (`taphoa2hand_backend`) 

**Bước 2: Cấu hình Database & Redis**
1. Khởi động MariaDb và tạo một database mới tên là `taphoa2hand_db`.
2. Khởi động **Redis Server** ở port mặc định là `6379`. *(Lưu ý: Nếu không bật Redis, tính năng gửi mã OTP sẽ báo lỗi 5007).*

**Bước 3: Cấu hình biến môi trường**
Mở file `src/main/resources/application.properties` và kiểm tra lại các thông số sau cho khớp với máy của bạn:

```properties
# Database Config
spring.datasource.url=jdbc:mysql://localhost:3306/taphoa2hand_db
spring.datasource.username=root
spring.datasource.password=mat_khau_cua_ban

# Redis Config
spring.redis.host=localhost
spring.redis.port=6379

# JWT Secret Key (Đổi thành key bảo mật của bạn)
jwt.secret=chuoi_ky_tu_bi_mat_dai_dong_nay_nen_duoc_thay_the
```

**Bước 4: Chạy dự án**
* Mở terminal trong thư mục backend và chạy lệnh: `mvn spring-boot:run`
* Hoặc nhấn nút **Run** trực tiếp trên IntelliJ.
* Backend khởi chạy thành công sẽ lắng nghe ở port: `http://localhost:8080`

---

## 🎨 3. Hướng dẫn khởi chạy Frontend (ReactJS)

**Bước 1: Cài đặt thư viện**
Mở terminal, di chuyển vào thư mục chứa code Frontend và chạy lệnh:
```bash
npm install
# hoặc dùng yarn: yarn install
```

**Bước 2: Cấu hình đường dẫn API**
Tạo một file `.env` ở thư mục gốc của Frontend (ngang hàng với `package.json`) và thêm cấu hình API Gateway:
```env
# Thay đổi URL này nếu Backend của bạn chạy ở port khác
VITE_API_GATEWAY=http://localhost:8080
```

**Bước 3: Chạy ứng dụng**
Khởi động development server bằng lệnh:
```bash
npm start
# hoặc nếu dùng Vite: npm run dev
```
* Mở trình duyệt và truy cập: `http://localhost:5173`

---
