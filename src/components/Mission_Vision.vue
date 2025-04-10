<template>
  <div class="mission_vision d-flex">
    <div class="mission">
      <h2 class="text-center">Sứ mệnh</h2>
      <p>
        Chúng tôi cam kết mang đến giải pháp tiện lợi và an toàn để hỗ trợ các gia đình Việt Nam trong việc quản lý công việc gia đình. Mỗi người giúp việc mà chúng tôi kết nối đều được đảm bảo về chất lượng, giúp bạn yên tâm giao phó ngôi nhà của mình.
      </p>
    </div>
    <div class="vision">
      <h2 class="text-center">Tầm nhìn</h2>
      <p>
        Trở thành nền tảng đặt lịch người giúp việc hàng đầu tại Việt Nam, nơi mọi gia đình đều có thể dễ dàng tìm thấy sự hỗ trợ phù hợp, giúp cuộc sống trở nên nhẹ nhàng và hạnh phúc hơn.
      </p>
    </div>
  </div>
</template>

<style scoped>
.mission_vision {
  font-family: 'Poppins', sans-serif; /* Áp dụng font Poppins */
  color: #333; /* Màu chữ tối để dễ đọc */
}

.mission, .vision {
  flex: 1; /* Đảm bảo mỗi phần chiếm đều không gian */
  min-width: 300px; /* Đảm bảo không bị co quá nhỏ trên mobile */
  padding: 40px; /* Tăng padding để thoáng hơn */
  border-radius: 10px; /* Bo góc cho đẹp */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Thêm bóng nhẹ để nổi bật */
  margin: 10px; /* Thêm khoảng cách giữa mission và vision */
  transition: transform 0.3s ease; /* Hiệu ứng hover */
}

.mission {
  background-color: #fff5e6; /* Màu nền nhẹ nhàng, thay cho antiquewhite */
}

.vision {
  background-color: #e6f5ff; /* Màu nền nhẹ nhàng, thay cho azure */
}

.mission:hover, .vision:hover {
  transform: translateY(-5px); /* Hiệu ứng nâng lên khi hover */
}

h2 {
  font-size: 2rem; /* Kích thước tiêu đề */
  font-weight: 700; /* Đậm */
  color: #2c3e50; /* Màu chữ đậm hơn */
  margin-bottom: 1.5rem; /* Khoảng cách giữa tiêu đề và nội dung */
  text-transform: uppercase; /* Chữ in hoa để nổi bật */
  letter-spacing: 1px; /* Khoảng cách giữa các chữ */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* Bóng nhẹ cho tiêu đề */
}

p {
  font-size: rem; /* Kích thước chữ vừa phải */
  font-weight: 400; /* Nhẹ để dễ đọc */
  line-height: 1.8; /* Khoảng cách dòng rộng để thoáng */
  color: #555; /* Màu chữ nhạt hơn một chút */
}

@media (max-width: 768px) {
  .mission_vision {
    flex-direction: column; /* Xếp dọc trên mobile */
  }

  .mission, .vision {
    margin: 10px 0; /* Điều chỉnh khoảng cách trên mobile */
    padding: 30px; /* Giảm padding trên mobile */
  }

  h2 {
    font-size: 1.5rem; /* Giảm kích thước tiêu đề trên mobile */
  }

  p {
    font-size: 1rem; /* Giảm kích thước chữ trên mobile */
  }
}
</style>