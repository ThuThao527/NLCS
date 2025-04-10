<template>
  <div class="adminBlog">
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
          <h4>List Blog</h4>
        </li>
        <li
          class="breadcrumb-item px-2 rounded"
          :class="{ active: currentStep === 1 }"
          @click="goBack"
        >
          <h4 style="width: 300px">Create Blog</h4>
        </li>
      </ol>
    </nav>
    <BlogForm v-if="currentStep == 1"></BlogForm>
    <div v-if="currentStep == 2">
      <BlogList></BlogList>
      <PdfViewer></PdfViewer>
    </div>
  </div>
</template>

<script setup>
import BlogForm from './BlogForm.vue';
import BlogList from './BlogList.vue';
import PdfViewer from './PdfViewer.vue';
import { ref } from 'vue';

const currentStep = ref(2);
const goNext = () => {
  if (currentStep.value < 2) currentStep.value++;
};

const goBack = () => {
  if (currentStep.value > 1) currentStep.value--;
};
</script>

<style scoped>
.adminBlog {
  background-color: #f5f7f8;
}
.breadcrumb .active {
  color: blue;
}
</style>
