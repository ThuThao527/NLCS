<template>
  <div class="body">
    <header>
      <Navigate></Navigate>
      <div class="heroimage">
        <div class="custom-shape-divider-bottom-1734586163">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              class="shape-fill"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              class="shape-fill"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              class="shape-fill"
            ></path>
          </svg>
        </div>
        <HeroSection
          image="https://media.architecturaldigest.com/photos/63c03bb39e3c619a867bf36a/16:9/w_1920,c_limit/carpet%20cleaning.jpg"
          p1="Về chúng tôi"
        ></HeroSection>
      </div>
      <div class="content text-center">
        <p>Chúng tôi là nền tảng đặt lịch người giúp việc hàng đầu, mang đến giải pháp tiện lợi, nhanh chóng và đáng tin cậy để hỗ trợ bạn trong cuộc sống bận rộn.</p>
      </div>
    </header>
    <main>
      <Mission_Vision></Mission_Vision>
      <Core_Value></Core_Value>
      <TheTeam></TheTeam>
      <div class="d-flex justify-content-center">
        <iframe
          style="border-radius: 10px"
          class="embed-responsive-item video"
          id="myVideo"
          src="https://www.youtube.com/embed/HOKtWDRwMNA?si=_JTkrMI7mVt4_zxi"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>
      </div>
      <Footer></Footer>
    </main>
  </div>
</template>

<script setup>
import Navigate from '@/components/Navigate.vue';
import HeroSection from '@/components/HeroSection.vue';
import Mission_Vision from '@/components/Mission_Vision.vue';
import TheTeam from '@/components/TheTeam.vue';
import Footer from '@/components/Footer.vue';
import Core_Value from '@/components/Core_Value.vue';
</script>

<style scoped>
main {
  overflow: hidden;
  background-color: rgb(228, 219, 196);
}
.heroimage {
  position: relative;
  height: 450px;
  overflow: hidden;
  z-index: 2;
}

header .content {
  background-color: rgba(31, 68, 95);
  font-size: 1.5rem;
  color: #fff;
  padding: 20px;
}

.custom-shape-divider-bottom-1734586163 {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  transform: rotate(180deg);
}

.custom-shape-divider-bottom-1734586163 svg {
  position: relative;
  display: block;
  width: calc(135% + 1.3px);
  height: 44px;
  transform: rotateY(180deg);
}

.custom-shape-divider-bottom-1734586163 .shape-fill {
  fill: rgba(31, 68, 95, 0.7);
}

iframe {
  width: 70%;
  height: 500px;
  margin: 30px;
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
.content .text-center p {
  font-size: 1.5 rem;
}
</style>
