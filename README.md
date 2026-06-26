# Fashion Store - Website Bán Thời Trang Online

Đây là đồ án tốt nghiệp xây dựng website bán thời trang online. Hệ thống gồm 3 phần chính: giao diện khách hàng bằng ReactJS, API backend bằng NodeJS Express và trang quản trị Admin bằng PHP.

## Công nghệ sử dụng

* Frontend: ReactJS, Bootstrap
* Backend API: NodeJS, ExpressJS
* Admin: PHP
* Database: MySQL / MariaDB
* Authentication: JWT cho khách hàng, Session cho Admin

## Cấu trúc thư mục

```text
fashion-store
├── api-nodejs
├── client-react
├── admin-php
├── database
└── README.md
```

## Chức năng khách hàng

* Xem danh sách sản phẩm
* Lọc sản phẩm theo danh mục
* Xem chi tiết sản phẩm
* Đăng ký tài khoản
* Đăng nhập tài khoản
* Thêm sản phẩm vào giỏ hàng
* Cập nhật số lượng sản phẩm trong giỏ hàng
* Đặt hàng thanh toán khi nhận hàng
* Xem lịch sử đơn hàng
* Xem chi tiết đơn hàng

## Chức năng Admin

* Đăng nhập trang quản trị
* Quản lý sản phẩm
* Thêm, sửa, xóa sản phẩm
* Upload hình ảnh sản phẩm
* Quản lý đơn hàng
* Cập nhật trạng thái đơn hàng
* Quản lý người dùng
* Khóa / mở khóa tài khoản người dùng
* Dashboard thống kê tổng quan

## Cài đặt database

Tạo database:

```sql
CREATE DATABASE fashion_store_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sau đó import các file SQL trong thư mục:

```text
database/
```

## Chạy Backend NodeJS

Di chuyển vào thư mục backend:

```bash
cd api-nodejs
npm install
```

Tạo file `.env` dựa theo file `.env.example`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fashion_store_app
DB_USER=root
DB_PASSWORD=
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
```

Chạy backend:

```bash
npm run dev
```

Backend chạy tại:

```text
http://localhost:5000
```

## Chạy Frontend React

Di chuyển vào thư mục frontend:

```bash
cd client-react
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## Chạy Admin PHP

Copy thư mục:

```text
admin-php
```

vào thư mục XAMPP:

```text
D:\xampp\htdocs\fashion-store-admin
```

Bật Apache và MySQL trong XAMPP.

Truy cập trang quản trị:

```text
http://localhost/fashion-store-admin
```

Tài khoản admin demo:

```text
Email: admin@gmail.com
Password: 123456
```

## Ghi chú

* Không upload file `.env` lên GitHub.
* File `.env.example` dùng làm mẫu cấu hình môi trường.
* Cần import database trước khi chạy backend và admin.
* Cần bật MySQL và Apache trong XAMPP để chạy trang Admin PHP.
