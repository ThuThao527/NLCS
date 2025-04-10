<template>
    <div id="carouselExample" class="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
      <div class="carousel-inner">
        <div class="carousel-item" :class="{ active: index === 0 }" v-for="(group, index) in groupedFeedbacks" :key="index">
          <div class="row justify-content-center">
            <div
              class="col-md-4"
              v-for="(feedback, idx) in group"
              :key="`group-${index}-feedback-${idx}`"
            >
              <div class="feedback-card text-center">
                <img :src="feedback.image" alt="Client" class="client-image mx-auto" />
                <h3 class="mt-3">{{ feedback.name }}</h3>
                <p class="mt-2">{{ feedback.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Controls -->
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        feedbacks: [
            { 
              image: "https://i.pinimg.com/736x/c5/8e/3a/c58e3af9ccd207f2f9a78a5c931513c8.jpg", 
              name: "Nguyễn Văn An", 
              text: "Dịch vụ tuyệt vời! Nhân viên đến đúng giờ, làm việc rất chuyên nghiệp. Nhà tôi sạch bóng sau 2 giờ, mọi ngóc ngách đều được xử lý kỹ lưỡng. Giá cả lại hợp lý nữa!" 
            },
            { 
              image: "https://i.pinimg.com/736x/d9/0d/c7/d90dc706dcb183adbe3cd58fd4415732.jpg", 
              name: "Trần Thị Bình", 
              text: "Căn hộ của tôi như được hồi sinh sau khi sử dụng dịch vụ. Đặc biệt ấn tượng với cách họ xử lý các vết bẩn cứng đầu trên sàn gỗ mà không làm trầy xước. Rất đáng đồng tiền!" 
            },
            { 
              image: "https://i.pinimg.com/736x/52/4f/c3/524fc353686d6ca311561a5e8ebfb8bc.jpg", 
              name: "Lê Minh Cường", 
              text: "Tôi đã thử nhiều dịch vụ nhưng đây là lần đầu hoàn toàn hài lòng. Nhân viên thân thiện, mang giày dép riêng khi vào nhà, và còn dọn dẹp gọn ghẽ dụng cụ sau khi làm xong. 10 điểm!" 
            },
            { 
              image: "https://i.pinimg.com/236x/a1/1c/a8/a11ca852b646486bf3a865eba30cdb44.jpg", 
              name: "Phạm Thu Hà", 
              text: "Sẽ tiếp tục ủng hộ dịch vụ lâu dài. Mỗi tuần họ đến dọn 2 lần, nhà cửa luôn thơm tho, sạch sẽ. Con tôi bị dị ứng bụi mà từ ngày dùng dịch vụ này đỡ hẳn." 
            },
            { 
              image: "https://i.pinimg.com/736x/95/ce/8e/95ce8e731cff602f4065f73799147cb9.jpg", 
              name: "Vũ Đức Duy", 
              text: "Rất chuyên nghiệp! Họ có đầy đủ dụng cụ từ máy hút bụi HEPA đến hóa chất an toàn. Nhân viên còn hướng dẫn tôi cách bảo quản nội thất sau khi dọn. Dịch vụ 5 sao!" 
            },
            { 
              image: "https://i.pinimg.com/236x/c2/60/1d/c2601dddaba71f57b39025e02aefc3b3.jpg", 
              name: "Hoàng Thị Lan", 
              text: "Chất lượng dịch vụ xuất sắc! Từ lần đầu sử dụng đến giờ luôn ổn định. Đặc biệt thích cách họ bọc giày dép bằng nilon và lau chùi tay nắm cửa kỹ lưỡng, rất an tâm mùa dịch." 
            },
          ],
          size: 3
      };
    },

    methods: {
    updateSize() {
        this.size = window.innerWidth < 768 ? 1 : 3;
    },
    },
    computed: {
        
      groupedFeedbacks() {
        // Nhóm feedback thành các nhóm 3 phần tử
        // const size = window.innerWidth < 768 ? 1 : 3;
        window.addEventListener('resize', this.updateSize);
        return this.feedbacks.reduce((result, item, index) => {
          const groupIndex = Math.floor(index / this.size);
          if (!result[groupIndex]) result[groupIndex] = [];
          result[groupIndex].push(item);
          return result;
        }, []);
      },
    },
  };
  </script>
  
  <style scoped>
  .feedback-card {
    max-width: 800px;
    height: 400px;
    margin: 20px auto;
    padding: 20px;
    color: black;
    background-color: rgb(240, 240, 240);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  .client-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    background-color: rgb(0, 0, 0, 0.2);
    border-radius: 50%;
  }
  .carousel .slide{
    background-color: #b3ede4;
  }
  </style>
  