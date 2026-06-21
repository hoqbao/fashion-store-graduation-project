# Fashion Store - Website Bán Thời Trang Online

Đây là đồ án tốt nghiệp xây dựng website bán thời trang online.

## Công nghệ sử dụng

- Frontend: ReactJS, Bootstrap
- Backend API: NodeJS, ExpressJS
- Admin: PHP
- Database: MySQL / MariaDB
- Authentication: JWT cho khách hàng, Session cho Admin

## Cấu trúc thư mục

```text
fashion-store
├── api-nodejs
├── client-react
├── admin-php
├── database
└── README.md

Chức năng chính
Khách hàng
Xem danh sách sản phẩm
Lọc sản phẩm theo danh mục
Xem chi tiết sản phẩm
Đăng ký, đăng nhập
Thêm sản phẩm vào giỏ hàng
Cập nhật số lượng giỏ hàng
Đặt hàng COD
Xem lịch sử đơn hàng
Xem chi tiết đơn hàng
Admin
Đăng nhập admin
Quản lý sản phẩm
Thêm, sửa, xóa sản phẩm
Upload hình ảnh sản phẩm
Quản lý đơn hàng
Cập nhật trạng thái đơn hàng
Quản lý người dùng
Khóa / mở khóa tài khoản người dùng
Dashboard thống kê tổng quan

Cài đặt database

Tạo database:

CREATE DATABASE fashion_store_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Sau đó import các file trong thư mục:

database/
Chạy Backend NodeJS
cd api-nodejs
npm install

Tạo file .env từ .env.example:

PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fashion_store_app
DB_USER=root
DB_PASSWORD=
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

Chạy API:

npm run dev

API chạy tại:

http://localhost:5000
Chạy Frontend React
cd client-react
npm install
npm run dev

Frontend chạy tại:

http://localhost:5173
Chạy Admin PHP

Copy thư mục:

admin-php

vào XAMPP:

D:\xampp\htdocs\fashion-store-admin

Mở XAMPP và bật:

Apache
MySQL

Truy cập Admin:

http://localhost/fashion-store-admin

Tài khoản admin demo:

Email: admin@gmail.com
Password: 123456