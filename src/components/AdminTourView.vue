<template>
  <div class="adminTour pb-5">
    <nav
      style="--bs-breadcrumb-divider: '|'"
      aria-label="breadcrumb"
      class="fs-4 my-2"
    >
      <ol class="breadcrumb fw-bold">
        <li
          class="breadcrumb-item px-2 rounded"
          :class="{ active: currentStep === 2 }"
          @click="goNext"
        >
          <h4>Thông tin cá nhân</h4>
        </li>
        <li
          class="breadcrumb-item px-2 rounded"
          :class="{ active: currentStep === 1 }"
          @click="goBack"
        >
          <h4 style="width: 300px">Lịch làm</h4>
        </li>
      </ol>
    </nav>
    <div v-if="currentStep == 1" class="createTour">
      <CreateTour
        :tourInf="tourInf"
        :dateForms="dateForms"
        :itinerary="itinerary"
        :serviceForms="serviceForms"
      ></CreateTour>
    </div>
    <div v-if="currentStep == 2" class="listlist">
      <TourSection></TourSection>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import TourSection from './TourSection.vue';
import CreateTour from './CreateTour.vue';

const currentStep = ref(2);

const goNext = () => {
  if (currentStep.value < 2) currentStep.value++;
};

const goBack = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const dateForms = reactive([{ date: null, Capacity: '' }]);
const serviceForms = reactive([{}]);
const itinerary = reactive([{}]);
const tourInf = reactive({
  TourName: '',
  Description: '',
  Price: '',
  Img_Tour: '',
  Duration: '',
});
</script>
<style scoped>
.adminTour {
  padding: 0 20px;
  background-color: #8cbbd3;
}
/* .form-control:invalid {
  border-color: red;
} */

.adminTour {
  overflow-y: auto; /* Hiển thị thanh cuộn dọc */
  overflow-x: hidden; /* Ẩn thanh cuộn ngang */
}

/* Tùy chỉnh thanh cuộn */
.adminTour::-webkit-scrollbar {
  width: 8px; /* Chiều rộng của thanh cuộn dọc */
}

.adminTour::-webkit-scrollbar-thumb {
  background-color: #888; /* Màu của thanh cuộn */
  border-radius: 4px; /* Bo góc thanh cuộn */
}

.adminTour::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* Màu của thanh cuộn khi hover */
}

.adminTour::-webkit-scrollbar-track {
  background: #f1f1f1; /* Màu nền của thanh cuộn */
}

#btn {
  margin-top: auto;
}

.breadcrumb .active {
  color: blue;
}
</style>
