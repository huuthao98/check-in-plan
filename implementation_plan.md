# Kế hoạch phát triển: Tích hợp Locket Plan & Spend vào hệ sinh thái hiện tại

Do nguồn lực có hạn, hệ thống backend của ứng dụng **Locket Plan & Spend** sẽ được tích hợp trực tiếp vào backend hiện có của dự án **Learn English** tại `D:\work\personal-project\learn-english\backend`. 

Mobile app vẫn sẽ được phát triển độc lập dưới dạng một ứng dụng React Native (Expo) riêng biệt, nhưng sẽ gọi API tới chung một server backend với dự án học tiếng Anh.

---

## Proposed Changes

### 1. Kiến trúc hệ thống (Shared Backend)

```mermaid
graph TD
    subgraph Mobile Apps
        MobileEng[Learn English App]
        MobileLocket[Locket Plan & Spend App]
    end
    
    subgraph Shared Backend (NestJS)
        API[NestJS Gateway API]
        Auth[Auth Module - Shared]
        ModEng[English Modules]
        ModLocket[Locket Modules: Plans, Checkins, Transactions]
    end
    
    subgraph Database
        DB[(MongoDB)]
    end

    MobileEng --> API
    MobileLocket --> API
    API --> Auth
    API --> ModEng
    API --> ModLocket
    Auth --> DB
    ModEng --> DB
    ModLocket --> DB
```

### 2. Thiết kế Cơ sở Dữ liệu (MongoDB/Mongoose Schemas)

Thay vì dùng bảng quan hệ, chúng ta sẽ tạo các Collection mới trong MongoDB và tham chiếu (ref) tới `User` schema hiện tại.

#### Schema `Plan` (Kế hoạch)
- `_id` (ObjectId)
- `userId` (ObjectId, ref: 'User')
- `title` (String): Tên kế hoạch (VD: "Uống nước")
- `reminderTime` (String): Giờ thông báo (VD: "08:30")
- `repeatDays` ([String]): Các ngày lặp lại `["Mon", "Wed"]`
- `isActive` (Boolean): Trạng thái bật/tắt

#### Schema `Checkin` (Ảnh Check-in & Locket)
- `_id` (ObjectId)
- `planId` (ObjectId, ref: 'Plan', required: false)
- `userId` (ObjectId, ref: 'User')
- `imageUrl` (String)
- `caption` (String)
- `visibility` (String, enum: `['PUBLIC', 'PRIVATE', 'SELECTED_FRIENDS']`)
- `status` (String, enum: `['ON_TIME', 'LATE_MAKEUP', 'SKIPPED']`)
- `allowedViewers` ([ObjectId], ref: 'User'): Danh sách User ID được phép xem nếu visibility = `SELECTED_FRIENDS`.
- `createdAt`, `updatedAt` (Timestamps)

#### Schema `Transaction` (Chi tiêu)
- `_id` (ObjectId)
- `checkinId` (ObjectId, ref: 'Checkin')
- `userId` (ObjectId, ref: 'User')
- `amount` (Number)
- `type` (String, enum: `['SPENT', 'EARNED']`)
- `category` (String)
- `transactionDate` (Date)

---

### 3. Phương án Tích hợp vào thư mục Backend

Backend hiện tại nằm ở `D:\work\personal-project\learn-english\backend`. Các thay đổi cụ thể:

1. **Khởi tạo Modules mới**:
   Chạy lệnh tạo module của NestJS trong thư mục backend hiện tại:
   - `nest g module plans`
   - `nest g module checkins`
   - `nest g module transactions`

2. **Chia sẻ Auth Module**:
   - Tái sử dụng `JwtAuthGuard` và cơ chế đăng nhập, cấp token hiện tại. Locket app sẽ gọi API `/auth/login` hiện có để lấy token.

3. **Lưu trữ hình ảnh**:
   - Bổ sung cấu hình Multer (hoặc Cloudinary/AWS S3) vào backend để hỗ trợ upload ảnh từ app Locket.

### 4. Lộ trình Triển khai (Execution Plan)

- **Bước 1**: Cập nhật backend hiện hành (`learn-english/backend`) bằng cách bổ sung các Mongoose Schemas và REST API cho ứng dụng Locket.
- **Bước 2**: Khởi tạo Mobile App mới cho Locket tại thư mục `D:\work\personal-project\locket-plan-spend-app`.
- **Bước 3**: Tích hợp luồng Đăng nhập (dùng chung API Auth) vào Mobile App.
- **Bước 4**: Xây dựng UI Camera, Kế hoạch, Quản lý chi tiêu, gọi tới API đã xây.

---

## Verification Plan

1. **Kiểm thử Tích hợp**:
   - Chạy thử backend hiện hành, xác nhận các chức năng của Learn English KHÔNG bị ảnh hưởng.
   - Thử nghiệm gửi request bằng Postman tới các endpoint mới `/plans`, `/checkins` bằng Token lấy từ tài khoản Learn English.
2. **Kiểm thử Mobile App Locket**:
   - Khả năng upload ảnh check-in và lưu kèm chi tiêu lên MongoDB.
