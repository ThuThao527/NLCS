<template>
  <div class="theteam">
    <h1 class="text-center my-3 section-title">TOP NHÂN VIÊN DỌN DẸP XUẤT SẮC</h1>
    <p class="text-center mb-4 section-subtitle">Những chuyên gia được khách hàng đánh giá 5 sao nhiều nhất</p>
    
    <div class="row justify-content-center">
      <Card_member
        position="Chuyên gia vệ sinh cao cấp ★★★★★ (4.9/5)"
        name="Nguyễn Thị Mai"
        description="Giữ kỷ lục 98% khách hàng đánh giá 5 sao | Chuyên xử lý các khu vực phức tạp | Đúng giờ 100% các ca làm việc"
        image="https://i.pinimg.com/736x/c4/5a/d9/c45ad9b8f4730fba4038caf7445b0f62.jpg"
        buttonText="Xem thêm"
        :rating="4.9"
      />
      <Card_member
        position="Vua xử lý vết bẩn ★★★★★ (4.8/5)"
        name="Trần Văn Nam"
        description="Nhận 152 đánh giá tích cực trong tháng | Được 87% khách hàng yêu cầu làm lại | Chuyên gia hóa chất thân thiện môi trường"
        image="https://i.pinimg.com/736x/47/e6/22/47e622527d9c7213d2b0d1fe7f447c6f.jpg"
        buttonText="Xem thêm"
        :rating="4.8"
      />
      <Card_member
        position="Kỹ thuật viên vàng ★★★★★ (5/5)"
        name="Lê Hoàng Anh"
        description="100% hài lòng về thiết bị vệ sinh | 45 khách hàng thân thiết | Sáng tạo 5 giải pháp dọn dẹp hiệu quả"
        image="https://i.pinimg.com/736x/dc/5f/2f/dc5f2fb25d21ef45b5745b6e215eaee8.jpg"
        buttonText="Xem thêm"
        :rating="5"
      />
    </div>
  </div>
</template>

<script setup>
import Card_member from '@/components/Card_member.vue';
</script>

<style scoped>
.theteam {
  background-color:  rgb(225, 220, 207);
  padding: 2rem 0;
}
.section-title {
  color: #1a5d7a;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}
.section-subtitle {
  color: #53575b;
  font-style: italic;
}
</style>