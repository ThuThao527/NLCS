<template>
  <div class="pdf-viewer-container">
    <!-- <header>
      <Navigate></Navigate>
      <div class="heroimage"></div>
    </header> -->
    <main>
      <div class="pdfFile container">
        <h1 class="text-center my-4">{{ file.Title }}</h1>

        <!-- Hiển thị trạng thái loading nếu chưa tải xong iframe -->
        <div v-if="loading" class="text-center">
          <p>Đang tải...</p>
        </div>

        <!-- Hiển thị iframe khi pdfViewerUrl đã có giá trị và không còn trạng thái loading -->
        <iframe
          :src="pdfViewerUrl"
          width="100%"
          height="0"
          frameborder="0"
          allowfullscreen
          :onLoad="onIframeLoad"
        ></iframe>
      </div>

      <!-- <Footer></Footer> -->
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
// import Navigate from './Navigate.vue';
// import Footer from './Footer.vue';

const route = useRoute();
const loading = ref(true); // Biến trạng thái loading
const pdfViewerUrl = ref('');
const file = ref({});

// Hàm gọi API để lấy dữ liệu tệp PDF
const fetchReportage = (postId) => {
  axios
    .get('/api/posts', {
      params: { category_name: 'reportage' },
    })
    .then((response) => {
      const link = response.data.filter((item) => {
        return item.PostID == postId;
      })[0];

      pdfViewerUrl.value = `http://localhost:3000/proxy?url=${encodeURIComponent(
        link.Link
      )}`;
      file.value = link;
    })
    .catch((error) => {
      console.error('Error fetching blogs:', error);
    });
};

// Sự kiện onLoad của iframe
const onIframeLoad = () => {
  loading.value = false; // Đặt trạng thái loading là false khi iframe tải xong
  const iframe = document.querySelector('iframe');
  iframe.style.height = '600px';
  console.log(loading.value);
};

onMounted(() => {
  const postId = route.params.id;
  fetchReportage(postId);
});
</script>

<style scoped>
header {
  height: 150px;
  background-color: #b3d5ed;
}
.pdf-viewer-container {
  height: 1500px;
  overflow: hidden;
}
iframe {
  border-radius: 5px;
  border: 1px solid black;
  margin-bottom: 30px;
  background-image: url('https://i.pinimg.com/originals/66/d6/7b/66d67bf4a0e2bf1ab10c3983b7fd1c5d.gif');
  background-repeat: no-repeat;
  background-position: 50% 50%;
}
</style>

<!-- <template>
  <div class="pdf-viewer-container">
    Khung hiển thị PDF
    <iframe
      :src="pdfViewerUrl"
      width="100%"
      height="800px"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'PDFViewer',
  props: {
    pdfPath: '/public/sample.pdf',
  },
  computed: {
    pdfViewerUrl() {
      // Liên kết tới file `viewer.html` của PDF.js và mở file PDF
      return `/pdfjs-4.9.155-dist/web/viewer.html?file=${encodeURIComponent(
        '../../public/sample.pdf'
      )}`;

      // return `/pdfjs-4.9.155-dist/web/viewer.html?file=${encodeURIComponent(
      //   '/pdfjs-4.9.155-dist/web/compressed.tracemonkey-pldi-09.pdf'
      // )}`;
    },
  },
};
</script>

<style scoped>
.pdf-viewer-container {
  height: 100vh;
  overflow: hidden;
}
</style> -->
