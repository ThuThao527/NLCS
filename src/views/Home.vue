<template>
  <div class="body">
    <header>
      <Navigate class="navigate"></Navigate>
      <HeroSection image ="https://cdn.prod.website-files.com/60eece3229f951ea48ce43b4/6638df8d1ce1f556221e1c05_how-often-should-you-clean-everything-in-your-house.webp" p1="TideFlex" p2="Uy tín & Chất lượng"></HeroSection>
    </header>
    <main>
      <CardsLayout></CardsLayout>
      <Feedback></Feedback>
      <Subscribe></Subscribe>
      <Footer></Footer>
    </main>
  </div>
</template>

<style>
.navigatge{
  margin: auto;
}

.hero-section {
  position: relative;
  height: 850px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
} 

.content {
  position: relative;
  z-index: 2;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Thêm bóng để chữ dễ đọc */
}

p {
  font-size: 1.2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>

<script setup>
import Navigate from '@/components/Navigate.vue';
import HeroSection from '@/components/HeroSection.vue';
import CardsLayout from '@/components/CardsLayout.vue';
import Footer from '@/components/Footer.vue';
import Feedback from '@/components/Feedback.vue';
import Subscribe from '@/components/Subscribe.vue';
</script>

