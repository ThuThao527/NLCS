<template>
  <div class="container-fluid mt-5 mx-3">
    <h2 class="text-center">Create Blog</h2>

    <div class="row">
      <!-- Column for Form -->
      <div class="col-md-12">
        <form @submit.prevent="createPost">
          <!-- Form fields for blog creation -->
          <div class="row">
            <div class="form-group col">
              <label for="author_id">Author ID</label>
              <select
                type="number"
                class="form-control"
                id="author_id"
                v-model="formData.AuthorID"
                required
              >
                <option disabled value="">Select Author</option>
                <option
                  v-for="author in admins"
                  :key="author.UserID"
                  :value="author.UserID"
                >
                  {{ author.FullName }}
                </option>
              </select>
            </div>
            <div class="form-group col">
              <label for="tourimg" class="form-label">Image of tour</label>
              <input
                type="file"
                id="tourimg"
                class="form-control"
                placeholder="Your Anwer"
                @change="handleImage"
                required
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="form-group">
                <label for="category_id">Category</label>
                <select
                  class="form-control"
                  id="category_id"
                  v-model="formData.CategoryID"
                  required
                >
                  <option disabled value="">Select a Category</option>
                  <option
                    v-for="category in categories"
                    :key="category.CategoryID"
                    :value="category.CategoryID"
                  >
                    {{ category.Name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="title">Title</label>
                <input
                  type="text"
                  class="form-control"
                  id="title"
                  v-model="formData.Title"
                  required
                />
              </div>
            </div>
            <div class="col">
              <img
                class="rounded border border-4 order-light-subtle"
                :src="formData.ImageUrl"
                alt=""
                style="height: 200px"
              />
            </div>
          </div>

          <div v-if="formData.CategoryID == 1" class="form-group">
            <label for="subtitle">Subtitle</label>
            <input
              type="text"
              class="form-control"
              id="subtitle"
              v-model="formData.Subtitle"
            />
          </div>
          <div v-if="formData.CategoryID == 1" class="form-group">
            <label for="content_intro">Content Intro</label>
            <textarea
              class="form-control"
              id="content_intro"
              v-model="formData.ContentIntro"
              rows="3"
              required
            ></textarea>
          </div>
          <div v-if="formData.CategoryID == 1" class="form-group">
            <label for="quote">Quote</label>
            <textarea
              class="form-control"
              id="quote"
              v-model="formData.Quote"
              rows="2"
            ></textarea>
          </div>
          <div v-if="formData.CategoryID == 1" class="form-group">
            <label for="content_body">Content Body</label>
            <textarea
              class="form-control"
              id="content_body"
              v-model="formData.ContentBody"
              rows="5"
              required
            ></textarea>
          </div>
          <div v-if="formData.CategoryID == 2" class="form-group">
            <label for="link">External Link</label>
            <input
              type="url"
              class="form-control"
              id="link"
              required
              v-model="formData.Link"
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
      <div class="col-md-12">
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
            formData.Title && formData.ContentIntro && formData.CategoryID == 1
          "
          class="preview-card"
        >
          <!-- Show preview of Actical_card or BlogContent based on state -->
          <div v-if="showPreviewCard">
            <Actical_card
              @click.stop
              @click.native.stop
              :image="formData.ImageUrl"
              :title="formData.Title"
              :description="formData.ContentIntro.slice(0, 100)"
              :author="formData.Author"
              :authorAvatar="formData.AuthorAvatar"
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
            formData.Title && formData.ContentIntro && formData.CategoryID == 2
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
  AuthorID: -1,
  CategoryID: '',
  ImageUrl: 'https://via.placeholder.com/800x400?text=No+Image+Available',
  Title: 'Title',
  Subtitle: '',
  ContentIntro: ' ',
  Quote: '',
  ContentBody: '',
  Author: 'Full Name',
  AuthorAvatar:
    'https://i.pinimg.com/736x/3a/d8/f9/3ad8f9d4a96c825e9efa524f6b4b70a4.jpg',
  Link: '',
  CreatedAt: '',
});

const categories = ref([]);
const admins = ref([]);

const message = ref('');
const success = ref(false);
const showBlogContent = ref(true); // Biến trạng thái để điều khiển việc hiển thị BlogContent
const showPreviewCard = ref(true); // Trạng thái hiển thị Actical Card

const createPost = async () => {
  try {
    if (formData.ImageUrl) {
      formData.ImageUrl = await uploadImage(formData.ImageUrl);
      console.log(formData.ImageUrl);
    }
    if (formData.Link) {
      const fileId = getDriveFileId(formData.Link);
      // Tạo URL tải xuống
      if (fileId) {
        formData.Link = `https://drive.google.com/uc?id=${fileId}&export=download`;
      } else {
        console.log('Không tìm thấy ID file trong URL.');
      }
    }
    const response = await axios.post('/api/posts', formData);
    message.value = response.data.message;
    success.value = true;
    console.log(response.data);
    axios.post(
      'https://hook.eu2.make.com/7xzu3q45dgkbhi650m8idth9qmpmenr9',
      response.data
    );
    // load lại trang

    alert('Create post successfully');
    window.location.reload();
  } catch (error) {
    message.value = error.response?.data?.message || 'Error creating post';
    success.value = false;
  }
};

function getDriveFileId(url) {
  const regex = /\/(?:file\/d|d)\/([a-zA-Z0-9_-]+)/;
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
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const fetchCategogy = async () => {
  try {
    const response = await axios.get(`/api/categories`);
    console.log(response.data);
    categories.value = response.data;
    formData.CreatedAt = new Date().toISOString();
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    formData.Author = userData.FullName;
    formData.AuthorID = userData.UserID;
  }
};

// const handleImage = (event) => {
//   const file = event.target.files[0];
//   if (!file) return;

//   // Kiểm tra loại file (chỉ chấp nhận ảnh)
//   if (!file.type.startsWith('image/')) {
//     alert('file is not an image');
//     console.error('File không phải là hình ảnh');
//     return;
//   }

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     const base64String = e.target.result;

//     // Kiểm tra xem Base64 có đúng định dạng không
//     if (!base64String.startsWith('data:image/')) {
//       console.error('Dữ liệu không phải hình ảnh hợp lệ');
//       alert('not suitable image');
//       return;
//     }

//     // Gán vào formData
//     formData.ImageUrl = base64String;
//     console.log('Base64 hợp lệ:', formData.ImageUrl);
//   };

//   reader.onerror = (error) => {
//     alert('Error reading file');
//     console.error('Error reading file:', error);
//   };

//   reader.readAsDataURL(file); // Đọc file dưới dạng Base64
// };

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file); // Append File object vào FormData

  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Bắt buộc phải có header này
      },
    });
    return response.data.imageUrl;
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    throw error;
  }
};

const handleImage = (event) => {
  const file = event.target.files[0];
  formData.ImageUrl = file;
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
