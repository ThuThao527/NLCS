<template>
    <div class="subscription-component text-center">
      <!-- Tiêu đề -->
      <h3 class="mb-4 fw-bold" style="color: #000; font-size: 1.5rem;">
        Nhận ưu đãi độc quyền từ chúng tôi
      </h3>
  
      <!-- Form -->
      <form class="d-flex justify-content-center align-items-center gap-2">
        <input
          type="email"
          class="form-control w-50"
          placeholder="Nhập email của bạn..."
          required
          style="font-size: 1.05rem;"
        />
        <button type="submit" class="btn btn-dark px-4" style="font-size: 1.05rem;">
          Đăng ký ngay
        </button>
      </form>
  
      <!-- Chú thích -->
      <p class="text-muted mt-3" style="max-width: 600px; margin:auto; font-size: 1rem;">
        Khi đăng ký, bạn sẽ nhận được các ưu đãi đặc biệt, mẹo vệ sinh nhà cửa và cập nhật dịch vụ mới nhất từ chúng tôi qua email. Bạn có thể hủy đăng ký bất cứ lúc nào.
      </p>
    </div>
  </template>
  
  <script>
  export default {
    name: "SubscriptionComponent",
  };
  </script>
  
  <style scoped>
  .subscription-component {
    background: linear-gradient(180deg,  rgb(228, 219, 196), rgb(228, 219, 196));
    padding: 40px 20px;
  }
  </style>