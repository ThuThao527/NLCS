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
          { image: "https://i.pinimg.com/736x/c5/8e/3a/c58e3af9ccd207f2f9a78a5c931513c8.jpg", name: "John Doe", text: "This is an awesome service! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorum nemo voluptate voluptatibus officiis aliquam sint blanditiis earum voluptas eum. Iusto totam delectus amet deserunt modi dignissimos voluptatem voluptatibus ea aut." },
          { image: "https://i.pinimg.com/736x/d9/0d/c7/d90dc706dcb183adbe3cd58fd4415732.jpg", name: "Asa Walter", text: "They revamped my company Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorum nemo voluptate voluptatibus officiis aliquam sint blanditiis earum voluptas eum. Iusto totam delectus amet deserunt modi dignissimos voluptatem voluptatibus ea aut." },
          { image: "https://i.pinimg.com/736x/52/4f/c3/524fc353686d6ca311561a5e8ebfb8bc.jpg", name: "Zahid Miles", text: "Loved working with them.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorum nemo voluptate voluptatibus officiis aliquam sint blanditiis earum voluptas eum. Iusto totam delectus amet deserunt modi dignissimos voluptatem voluptatibus ea aut." },
          { image: "https://i.pinimg.com/236x/a1/1c/a8/a11ca852b646486bf3a865eba30cdb44.jpg", name: "Casper Leigh", text: "I will continue using their services.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorum nemo voluptate voluptatibus officiis aliquam sint blanditiis earum voluptas eum. Iusto totam delectus amet deserunt modi dignissimos voluptatem voluptatibus ea aut." },
          { image: "https://i.pinimg.com/736x/95/ce/8e/95ce8e731cff602f4065f73799147cb9.jpg", name: "Cian Ross", text: "They are very knowledgeable.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorum nemo voluptate voluptatibus officiis aliquam sint blanditiis earum voluptas eum. Iusto totam delectus amet deserunt modi dignissimos voluptatem voluptatibus ea aut." },
          { image: "https://i.pinimg.com/236x/c2/60/1d/c2601dddaba71f57b39025e02aefc3b3.jpg", name: "Nina Snow", text: "Excellent quality services.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorum nemo voluptate voluptatibus officiis aliquam sint blanditiis earum voluptas eum. Iusto totam delectus amet deserunt modi dignissimos voluptatem voluptatibus ea aut." },
        ],
        size: 3,
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
  </style>
  