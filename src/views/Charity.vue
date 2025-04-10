<template>
  <div class="charity">
    <header>
      <Navigate></Navigate>
      <div class="heroimage">
        <HeroSection
          image="https://media.istockphoto.com/id/2151038293/vi/anh/beautiful-halong-city-quang-ninh-vietnam.jpg?s=2048x2048&w=is&k=20&c=jV0iDZAOCQp-GUMjW3oOjdJZfxm5Sl080Z2smrUQHS0="
          p1="our community project"
        ></HeroSection>
      </div>
    </header>
    <main>
      <RatingComponent></RatingComponent>
      <Project></Project>
      <TourSection></TourSection>
      <OrderHistory></OrderHistory>
      <Footer></Footer>
    </main>
  </div>
</template>

<script setup>
import Navigate from '@/components/Navigate.vue';
import HeroSection from '@/components/HeroSection.vue';
import Footer from '@/components/Footer.vue';
// import Project from '@/components/Project.vue';
import RatingComponent from '@/components/RatingComponent.vue';
// import TourSection from '@/components/TourSection.vue';
// import OrderHistory from '@/components/OrderHistory.vue';
</script>

<style scoped>
.heroimage {
  height: 450px;
  overflow: hidden;
}
</style>
