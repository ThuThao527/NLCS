<template>
  <div class="adminService">
    <h4 class="m-2">Create Service</h4>
    <form @submit.prevent="createServices" class="row">
      <div class="col-sm-6">
        <label for="service_name" class="form-label">Service Name</label>
        <input
          type="text"
          id="service_name"
          class="form-control"
          v-model="service.ServiceName"
          required
          placeholder="Your Answer"
        />
      </div>

      <div class="col-sm-3">
        <label for="price" class="form-label">Price</label>
        <input
          type="number"
          id="price"
          class="form-control"
          min="0"
          v-model="service.Price"
          placeholder="$0"
          required
        />
      </div>
      <div class="col-12 my-2">
        <label for="description" class="form-label">Description</label>
        <textarea
          id="description"
          type="text"
          v-model="service.Description"
          class="form-control"
          placeholder=""
          required
        ></textarea>
      </div>

      <div class="text-end">
        <button type="submit" class="btn btn-primary my-3">
          Create Service
        </button>
      </div>
      <div
        v-if="message"
        class="alert mt-3"
        :class="{ 'alert-success': success, 'alert-danger': !success }"
      >
        {{ message }}
      </div>
    </form>
    <hr />
    <nav
      style="--bs-breadcrumb-divider: '|'"
      aria-label="breadcrumb"
      class="fs-4 my-2"
    >
      <ol class="breadcrumb fw-bold">
        <li
          class="breadcrumb-item px-2 rounded"
          :class="{ active: currentStep === 1 }"
          @click="goBack"
        >
          List Services
        </li>
        <li
          class="breadcrumb-item px-2 rounded"
          :class="{ active: currentStep === 2 }"
          @click="goNext"
        >
          Deleted Services
        </li>
      </ol>
    </nav>
    <div v-if="currentStep == 1" class="table-responsive">
      <table class="table table-striped table-bordered table-hover table-sm">
        <thead class="table-light">
          <tr>
            <th class="fw-bold">#</th>
            <th class="fw-bold">Service Name</th>
            <th class="fw-bold">Price</th>
            <th class="fw-bold">Description</th>
            <th class="fw-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in services.filter(
              (service) => service.IsDeleted === 0
            )"
            :key="index"
          >
            <td>{{ index + 1 }}</td>
            <td v-if="editableRow !== item.ServiceID">
              {{ item.ServiceName }}
            </td>
            <td v-else>
              <input v-model="editedData.ServiceName" class="form-control" />
            </td>

            <td v-if="editableRow !== item.ServiceID">{{ item.Price }}</td>
            <td v-else>
              <input v-model="editedData.Price" class="form-control" />
            </td>

            <td v-if="editableRow !== item.ServiceID">
              {{ item.Description }}
            </td>
            <td v-else>
              <textarea
                v-model="editedData.Description"
                class="form-control"
                cols="15"
                rows="5"
              ></textarea>
            </td>
            <td>
              <div v-if="editableRow != item.ServiceID">
                <button
                  class="btn btn-sm btn-outline-success mx-1"
                  @click="editService(item)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-outline-danger mx-1"
                  @click="deleteService(item.ServiceID)"
                >
                  Delete
                </button>
              </div>
              <div v-else>
                <button
                  @click="saveEdit"
                  class="btn btn-sm btn-outline-primary mx-1"
                >
                  Save
                </button>
                <button
                  @click="cancelEdit"
                  class="btn btn-sm btn-outline-secondary mx-1"
                >
                  Cancel
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="currentStep == 2" class="table-responsive">
      <table class="table table-striped table-bordered table-hover table-sm">
        <thead class="table-light">
          <tr>
            <th class="fw-bold">#</th>
            <th class="fw-bold">Service Name</th>
            <th class="fw-bold">Price</th>
            <th class="fw-bold">Description</th>
            <th class="fw-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in services.filter(
              (service) => service.IsDeleted != 0
            )"
            :key="index"
          >
            <td>{{ index + 1 }}</td>

            <td v-if="editableRow !== item.ServiceID">
              {{ item.ServiceName }}
            </td>
            <td v-else>
              <input v-model="editedData.ServiceName" class="form-control" />
            </td>

            <td v-if="editableRow !== item.ServiceID">{{ item.Price }}</td>
            <td v-else>
              <input v-model="editedData.Price" class="form-control" />
            </td>

            <td v-if="editableRow !== item.ServiceID">
              {{ item.Description }}
            </td>
            <td v-else>
              <input v-model="editedData.Description" class="form-control" />
            </td>

            <td>
              <button
                class="btn btn-sm btn-outline-success"
                @click="restoreService(item.ServiceID)"
              >
                Restore
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import axios from 'axios';

const currentStep = ref(1);

const goNext = () => {
  if (currentStep.value < 2) currentStep.value++;
};

const goBack = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const message = ref('');
const success = ref(false);
const service = ref({});
const services = ref([]);

const deleteService = async (ServiceID) => {
  const isConfirmed = confirm('Are you sure you want to DELETE this service');
  if (!isConfirmed) {
    console.log('Deletion canceled by user.');
    return;
  }
  try {
    const response = await axios.put(`/api/delete_service/${ServiceID}`);
    console.log(response.status);
    fetchService();
  } catch (error) {
    alert('This service is being used');

    console.log(error);
  }
};

const restoreService = async (ServiceID) => {
  const isConfirmed = confirm('Are you sure you want to RESTORE this service');
  if (!isConfirmed) {
    console.log('Restore canceled by user.');
    return;
  }
  try {
    const response = await axios.put(`/api/restore_service/${ServiceID}`);
    console.log(response.status);
    fetchService();
  } catch (error) {
    console.log(error);
  }
};

const createServices = async () => {
  if (service.value) {
    try {
      services.value.push({ ...service.value });
      const response = await axios.post(`/api/create_service`, service.value);
      service.value = {};
      console.log(response.data.message);
      message.value = response.data.message;
      success.value = true;
      fetchService();
    } catch (error) {
      message.value = error.response?.data?.message || 'Error creating post';
      success.value = false;
    }
  } else {
    alert('Vui lòng nhập đầy đủ thông tin!');
  }
};

const fetchService = async () => {
  try {
    const response = await axios.get('/api/services');
    services.value = response.data.reverse();
  } catch (error) {
    console.log(error);
  }
};

const editableRow = ref(null); // Theo dõi ID của hàng đang chỉnh sửa
const editedData = reactive({}); // Lưu thông tin chỉnh sửa tạm thời

const editService = (item) => {
  editableRow.value = item.ServiceID; // Gán hàng đang chỉnh sửa
  editedData.ServiceID = item.ServiceID;
  editedData.ServiceName = item.ServiceName;
  editedData.Price = item.Price;
  editedData.IsDeleted = item.IsDeleted;
  editedData.Description = item.Description;
};

const saveEdit = async () => {
  try {
    const response = await axios.put('/api/update_service', editedData);
    if (response.status == 200) {
      // Tải lại danh sách service
      fetchService();
      editableRow.value = null; // Thoát khỏi chế độ chỉnh sửa
      alert(response.data.message);
    }
  } catch (error) {
    console.log('Error updating user:', error);
    alert('Error updating user');
  }
};

const cancelEdit = () => {
  editableRow.value = null; // Hủy chỉnh sửa
};

onMounted(() => {
  fetchService();
});
</script>

<style scoped>
.adminService {
  background-color: #f5f7f8;
}

.table-responsive {
  border-radius: 10px;
  border: 1px solid #ddd;
}

.breadcrumb .active {
  color: blue;
}
</style>
