<template>
  <div class="core_value">
    <div class="core">
      <h2>Giá trị cốt lõi</h2>
      <ul class="value-list">
        <li>
          <strong>Chuyên nghiệp:</strong> Đội ngũ người giúp việc được đào tạo kỹ lưỡng, đảm bảo chất lượng dịch vụ cao nhất.
        </li>
        <li>
          <strong>Tiện lợi:</strong> Đặt lịch nhanh chóng qua ứng dụng hoặc website, chỉ trong vài phút.
        </li>
        <li>
          <strong>Đáng tin cậy:</strong> Mọi người giúp việc đều được kiểm tra lý lịch và đánh giá bởi khách hàng trước đó.
        </li>
        <li>
          <strong>Minh bạch:</strong> Giá cả rõ ràng, không phí ẩn, giúp bạn dễ dàng quản lý chi phí.
        </li>
        <li>
          <strong>Hỗ trợ 24/7:</strong> Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào.
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.core_value {
  font-family: 'Poppins', sans-serif; /* Áp dụng font Poppins */
  color: #333; /* Màu chữ tối để dễ đọc */
}

.core {
  text-align: center;
  padding: 40px; /* Tăng padding để thoáng hơn */
  background-color: #f0f7ff; /* Màu nền nhẹ nhàng, thay cho aliceblue */
  border-radius: 10px; /* Bo góc cho đẹp */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Thêm bóng nhẹ để nổi bật */
  margin: 20px auto; /* Căn giữa và thêm khoảng cách */
  max-width: 800px; /* Giới hạn chiều rộng để dễ đọc */
  transition: transform 0.3s ease; /* Hiệu ứng hover */
}

.core:hover {
  transform: translateY(-5px); /* Hiệu ứng nâng lên khi hover */
}

h2 {
  font-size: 2.5rem; /* Kích thước tiêu đề */
  font-weight: 700; /* Đậm */
  color: #2c3e50; /* Màu chữ đậm hơn */
  margin-bottom: 2rem; /* Khoảng cách giữa tiêu đề và nội dung */
  text-transform: uppercase; /* Chữ in hoa để nổi bật */
  letter-spacing: 1px; /* Khoảng cách giữa các chữ */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* Bóng nhẹ cho tiêu đề */
}

.value-list {
  list-style: none; /* Bỏ dấu đầu dòng mặc định */
  padding: 0;
  text-align: left; /* Căn trái nội dung danh sách */
  max-width: 600px; /* Giới hạn chiều rộng danh sách */
  margin: 0 auto; /* Căn giữa danh sách */
}

.value-list li {
  font-size: 1.1rem; /* Kích thước chữ vừa phải */
  font-weight: 400; /* Nhẹ để dễ đọc */
  line-height: 1.8; /* Khoảng cách dòng rộng để thoáng */
  color: #555; /* Màu chữ nhạt hơn một chút */
  margin-bottom: 1rem; /* Khoảng cách giữa các mục */
  padding-left: 30px; /* Thêm khoảng cách bên trái để chèn biểu tượng */
  position: relative; /* Để định vị biểu tượng */
}

.value-list li::before {
  content: '\f058'; /* Biểu tượng check từ Font Awesome */
  font-family: 'Font Awesome 5 Free'; /* Sử dụng Font Awesome */
  font-weight: 900;
  color: #3498db; /* Màu xanh cho biểu tượng */
  position: absolute;
  left: 0;
  top: 5px;
}

.value-list li strong {
  font-weight: 600; /* Đậm cho từ khóa */
  color: #2c3e50; /* Màu đậm hơn cho từ khóa */
}

@media (max-width: 768px) {
  .core {
    padding: 30px; /* Giảm padding trên mobile */
    margin: 10px; /* Giảm khoảng cách trên mobile */
  }

  h2 {
    font-size: 2rem; /* Giảm kích thước tiêu đề trên mobile */
  }

  .value-list li {
    font-size: 1rem; /* Giảm kích thước chữ trên mobile */
  }
}
</style>