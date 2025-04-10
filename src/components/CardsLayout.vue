<script setup>
import Card from './Card.vue';

</script>

<template>
  <div class="cardslayout container text-center justify-content-center">
    <div class="cards row justify-content-center">
      <Card
        title="Uy Tín - Chuyên Nghiệp"
        description="Cam kết dịch vụ đúng giờ, nhân viên được đào tạo bài bản, làm việc có trách nhiệm.
          Khách hàng yên tâm về độ tin cậy, minh bạch trong quy trình và hợp đồng rõ ràng."
        image="https://www.thespruce.com/thmb/f-8SHiPrpdI-V5cfbamOOno5fzI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SPR-house-cleaning-checklist-5443113-hero-bfe165b4af2f4a86ac0ace570db9a333.jpg"
        buttonLink="/About"
        buttonText="Tìm hiểu thêm"
      />
      <Card
        title="Sạch Sẽ - Tỉ Mỉ"
        description="Sử dụng công nghệ/thiết bị hiện đại, vệ sinh toàn diện từ góc nhỏ đến không gian lớn.
        Môi trường sống/làm việc sạch sẽ, không sót khu vực, đảm bảo vệ sinh tiêu chuẩn cao."
        image="https://img.iproperty.com.my/angel/750x1000-fit/wp-content/uploads/sites/2/2021/03/professional-house-cleaning-services-malaysia.jpg"
        buttonText="Tìm hiểu thêm"
      />
      <Card
        title="An Toàn - Thân Thiện"
        description="Hóa chất an toàn, thân thiện với trẻ em/vật nuôi, nhân viên lịch sự và tôn trọng không gian riêng tư.
Bảo vệ sức khỏe gia đình và môi trường, trải nghiệm dịch vụ thoải mái."
        image="https://fastmaidservice.com/wp-content/uploads/2024/02/House-Cleaning-Service-scaled.jpeg"
        buttonLink="/Charity"
        buttonText="Tìm hiểu thêm"
      />
    </div>
    <iframe
      style="border-radius: 10px"
      class="embed-responsive-item video"
      id="myVideo"
      src="https://www.youtube.com/embed/IJCEpbIHTa8?si=Zom0e-alZtNKHuv6"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen
    ></iframe>
  </div>
</template>

<style scoped>
.cardslayout {
  min-width: 100%;
  background-color:  rgb(228, 219, 196);
  margin: 0;
  height: max-content;
}
.cards {
  padding: 40px;
}

@media (max-width: 576px) {
  iframe {
    width: 80%;
    height: 300px;
  }
}

/* Khi màn hình có độ rộng từ 768px trở lên (md) */
@media (min-width: 768px) {
  iframe {
    width: 70%;
    height: 500px;
    margin: 30px;
  }
}
</style>
