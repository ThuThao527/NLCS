<template>
  <div class="body">
    <header>
      <Navigate></Navigate>
      <HeroSection
        image="https://www.themuseumoutlet.com/wp-content/uploads/2020/09/Best-Cheap-Home-Decor-Websites.jpg"
      ></HeroSection>
      <div class="welcome">
        <h1>Chính Sách Dịch Vụ</h1>
        <p>Cam kết minh bạch và công bằng cho cả người thuê và người giúp việc</p>
      </div>
    </header>
    <main class="policy-content">
      <section class="policy-section employer-policy">
        <h2>Chính Sách Dành Cho Người Thuê</h2>
        <div class="policy-card">
          <h3>1. Quyền Lợi</h3>
          <ul>
            <li>Được lựa chọn người giúp việc phù hợp từ danh sách đã xác minh.</li>
            <li>Hỗ trợ 24/7 từ đội ngũ chăm sóc khách hàng.</li>
            <li>Đảm bảo hoàn tiền nếu dịch vụ không đạt yêu cầu (theo điều khoản).</li>
          </ul>
        </div>
        <div class="policy-card">
          <h3>2. Nghĩa Vụ</h3>
          <ul>
            <li>Cung cấp thông tin chính xác về nhu cầu công việc.</li>
            <li>Thanh toán đúng hạn theo thỏa thuận với người giúp việc.</li>
            <li>Tôn trọng và đối xử công bằng với người giúp việc.</li>
          </ul>
        </div>
        <div class="policy-card">
          <h3>3. Quy Định Thanh Toán</h3>
          <ul>
            <li>Thanh toán qua nền tảng để đảm bảo an toàn.</li>
            <li>Phí dịch vụ: 5% giá trị hợp đồng (tối thiểu 50.000 VNĐ).</li>
            <li>Hủy dịch vụ trước 24h không mất phí; sau đó chịu phạt 10%.</li>
          </ul>
        </div>
      </section>

      <section class="policy-section helper-policy">
        <h2>Chính Sách Dành Cho Người Giúp Việc</h2>
        <div class="policy-card">
          <h3>1. Quyền Lợi</h3>
          <ul>
            <li>Nhận công việc phù hợp với kỹ năng và mong muốn.</li>
            <li>Được bảo vệ quyền lợi qua hợp đồng rõ ràng.</li>
            <li>Hỗ trợ giải quyết tranh chấp với người thuê.</li>
          </ul>
        </div>
        <div class="policy-card">
          <h3>2. Nghĩa Vụ</h3>
          <ul>
            <li>Hoàn thành công việc đúng cam kết với người thuê.</li>
            <li>Cung cấp thông tin cá nhân chính xác để xác minh.</li>
            <li>Báo cáo kịp thời nếu có vấn đề phát sinh trong công việc.</li>
          </ul>
        </div>
        <div class="policy-card">
          <h3>3. Quy Định Thu Nhập</h3>
          <ul>
            <li>Nhận thanh toán sau khi hoàn thành công việc.</li>
            <li>Phí nền tảng: 10% thu nhập từ mỗi hợp đồng.</li>
            <li>Có thể yêu cầu rút tiền về tài khoản ngân hàng hàng tuần.</li>
          </ul>
        </div>
      </section>
    </main>
    <footer>
      <Footer></Footer>
    </footer>
  </div>
</template>

<style scoped>
.body {
  background-color: #e7cfb3;
  min-height: 100vh; /* Đảm bảo body chiếm toàn bộ chiều cao viewport */
  display: flex;
  flex-direction: column; /* Sắp xếp header, main, footer theo cột */
}

header {
  position: relative;
  flex-shrink: 0; /* Ngăn header bị co lại */
}

main.policy-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 40px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  color: #1a1a1a;
  flex-grow: 1; /* Đảm bảo main chiếm không gian còn lại */
  position: relative; /* Đảm bảo main không bị đè */
  z-index: 1; /* Đặt z-index thấp hơn footer nếu cần */
}

.welcome {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  width: 80%;
  max-width: 900px;
  padding: 30px;
  background-color: rgba(31, 68, 95, 0.95);
  border-radius: 50px 0 50px 0;
}

footer {
  flex-shrink: 0; /* Ngăn footer bị co lại */
  position: relative; /* Đảm bảo footer nằm trong luồng tự nhiên */
  width: 100%;
  z-index: 0; /* Đặt z-index thấp hơn main nếu cần */
  margin-top: 100px;
}

/* Override style của Footer.vue */
footer :deep(.policy-footer) {
  position: relative !important; /* Bỏ position: fixed nếu có */
  margin-top: 100px; /* Thêm khoảng cách trên để không đè lên main */
  text-align: center;
  padding: 30px 20px;
  background: #1a1a1a; /* Màu nền đen như trong ảnh */
  color: white; /* Chữ trắng */
  font-size: 1rem;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

/* Policy Section */
.policy-section {
  flex: 1;
  min-width: 300px;
}

.policy-section h2 {
  font-size: 2rem;
  color: #2563eb;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;
}

.policy-section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: #2563eb;
  border-radius: 2px;
}

.policy-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.policy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.policy-card h3 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 15px;
}

.policy-card ul {
  list-style: none;
  padding-left: 0;
}

.policy-card li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.policy-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #2563eb;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .welcome {
    width: 90%;
    padding: 20px;
  }

  main.policy-content {
    flex-direction: column;
    padding: 20px;
  }

  .policy-section h2 {
    font-size: 1.75rem;
  }

  .policy-card h3 {
    font-size: 1.25rem;
  }

  .policy-card li {
    font-size: 1rem;
  }
}
</style>

<script setup>
import Navigate from '@/components/Navigate.vue';
import HeroSection from '@/components/HeroSection.vue';
import Footer from '@/components/Footer.vue';
</script>