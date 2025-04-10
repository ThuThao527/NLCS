<template>
  <div class="container-fluid mt-5 mx-3">
    <h2 class="text-center">Create Blog</h2>

    <div class="row">
      <!-- Column for Form -->
      <div class="col-md-6">
        <form @submit.prevent="createPost">
          <!-- Form fields for blog creation -->
          <div class="form-group">
            <label for="author_id">Author ID</label>
            <select
              type="number"
              class="form-control"
              id="author_id"
              v-model="formData.author_id"
              required
            >
              <option disabled value="">Select Author</option>
              <option
                v-for="author in admins"
                :key="author.id"
                :value="author.id"
              >
                {{ author.username }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="category_id">Category</label>
            <select
              class="form-control"
              id="category_id"
              v-model="formData.category_id"
              required
            >
              <option disabled value="">Select a Category</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="image_url">Image URL</label>
            <input
              type="text"
              class="form-control"
              id="image_url"
              v-model="formData.image_url"
              required
            />
          </div>
          <div class="form-group">
            <label for="title">Title</label>
            <input
              type="text"
              class="form-control"
              id="title"
              v-model="formData.title"
              required
            />
          </div>
          <div v-if="formData.category_id == 1" class="form-group">
            <label for="subtitle">Subtitle</label>
            <input
              type="text"
              class="form-control"
              id="subtitle"
              v-model="formData.subtitle"
            />
          </div>
          <div v-if="formData.category_id == 1" class="form-group">
            <label for="content_intro">Content Intro</label>
            <textarea
              class="form-control"
              id="content_intro"
              v-model="formData.content_intro"
              rows="3"
              required
            ></textarea>
          </div>
          <div v-if="formData.category_id == 1" class="form-group">
            <label for="quote">Quote</label>
            <textarea
              class="form-control"
              id="quote"
              v-model="formData.quote"
              rows="2"
            ></textarea>
          </div>
          <div v-if="formData.category_id == 1" class="form-group">
            <label for="content_body">Content Body</label>
            <textarea
              class="form-control"
              id="content_body"
              v-model="formData.content_body"
              rows="5"
              required
            ></textarea>
          </div>
          <div v-if="formData.category_id == 2" class="form-group">
            <label for="link">External Link</label>
            <input
              type="url"
              class="form-control"
              id="link"
              v-model="formData.link"
            />
          </div>
          <button type="submit" class="btn btn-primary btn-block my-3">
            Create Post
          </button>
        </form>
        <div
          v-if="message"
          class="alert mt-3"
          :class="{ 'alert-success': success, 'alert-danger': !success }"
        >
          {{ message }}
        </div>
      </div>

      <!-- Column for Preview -->
      <div class="col-md-6">
        <!-- Các nút điều khiển hiển thị -->
        <div class="text-center mb-4">
          <button
            class="btn mx-2"
            :class="{
              'btn-secondary': !showPreviewCard,
              'btn-success': showPreviewCard,
            }"
            @click="togglePreviewCard"
          >
            {{ showPreviewCard ? 'On Card' : 'Off Card' }}
          </button>
          <button
            class="btn"
            :class="{
              'btn-secondary': !showBlogContent,
              'btn-success': showBlogContent,
            }"
            @click="toggleBlogContent"
          >
            {{ showBlogContent ? 'On Blog' : 'Off Blog' }}
          </button>
        </div>
        <div
          v-if="
            formData.title &&
            formData.content_intro &&
            formData.category_id == 1
          "
          class="preview-card"
        >
          <!-- Show preview of Actical_card or BlogContent based on state -->
          <div v-if="showPreviewCard">
            <Actical_card
              :image="formData.image_url"
              :title="formData.title"
              :description="formData.content_intro.slice(0, 100)"
              :author="formData.author"
              :authorAvatar="formData.authorAvatar"
              :views="0"
              :id="null"
              :create_at="new Date().toISOString()"
            ></Actical_card>
          </div>
          <div>
            <BlogContent v-if="showBlogContent" :blog="formData" />
            <!-- Display full blog content -->
          </div>
        </div>
        <div
          v-if="
            formData.title &&
            formData.content_intro &&
            formData.category_id == 2
          "
          class="preview-card"
        >
          <pdfCard :file="formData"></pdfCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import Actical_card from './Actical_card.vue';
import BlogContent from './BlogContent.vue'; // Đảm bảo bạn đã import đúng component BlogContent
import pdfCard from './pdfCard.vue';

const formData = reactive({
  author_id: -1,
  category_id: '',
  image_url: 'https://via.placeholder.com/800x400?text=No+Image+Available',
  title: 'Title',
  subtitle: '',
  content_intro: ' ',
  quote: '',
  content_body: '',
  author: 'Full Name',
  authorAvatar:
    'https://i.pinimg.com/736x/3a/d8/f9/3ad8f9d4a96c825e9efa524f6b4b70a4.jpg',
  link: '',
  created_at: '',
});

const categories = ref([]);
const admins = ref([]);

const message = ref('');
const success = ref(false);
const showBlogContent = ref(true); // Biến trạng thái để điều khiển việc hiển thị BlogContent
const showPreviewCard = ref(true); // Trạng thái hiển thị Actical Card

const createPost = async () => {
  try {
    if (formData.link) {
      const fileId = getDriveFileId(formData.link);
      // Tạo URL tải xuống
      if (fileId) {
        formData.link = `https://drive.google.com/uc?id=${fileId}&export=download`;
      } else {
        console.log('Không tìm thấy ID file trong URL.');
      }
    }
    const response = await axios.post('/api/posts', formData);
    message.value = response.data.message;
    success.value = true;
  } catch (error) {
    message.value = error.response?.data?.message || 'Error creating post';
    success.value = false;
  }
};

function getDriveFileId(url) {
  const regex = /\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Hàm xử lý khi click vào Actical_card
const toggleBlogContent = () => {
  showBlogContent.value = !showBlogContent.value;
};
const togglePreviewCard = () => {
  showPreviewCard.value = !showPreviewCard.value;
};

const fetchAdmin = async () => {
  try {
    const response = await axios.get(`/api/users/admin`);
    admins.value = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const fetchCategogy = async () => {
  try {
    const response = await axios.get(`/api/categories`);
    categories.value = response.data;
    formData.created_at = new Date().toISOString();
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    formData.author = userData.username;
    formData.author_id = userData.id;
  }
};

onMounted(() => {
  fetchCategogy();
  fetchAdmin();
  fetchUser();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.row {
  display: flex;
  justify-content: space-between;
}

.col-md-6 {
  padding: 10px;
}
</style>
