<template>
  <div class="body">
    <header>
      <Navigate class="navigate"></Navigate>
      <div class="herosection">
        <HeroSection
          image="https://media.istockphoto.com/id/488876192/vi/anh/hoi-an-vietnam.jpg?s=2048x2048&w=is&k=20&c=i9PyzEChi5gMuB4Jf1HAzOmdEmY28_Bo3aBVx0tJb3Q="
          p1="Book Your Helper"
          p2="Find the perfect helper for your needs"
        ></HeroSection>
      </div>
    </header>

    <!-- Thanh tìm kiếm -->
    <div class="search-bar container my-4">
      <input
        v-model="searchName"
        type="text"
        class="form-control"
        placeholder="Search Helper by Name"
        @input="fetchHelpers"
      />
    </div>

    <!-- Kết quả tìm kiếm (danh sách Helper) -->
    <div class="container my-4">
      <h3>Helpers</h3>
      <div class="row">
        <div v-for="helper in helpers" :key="helper.HelperID" class="col-md-3 mb-4">
          <div class="card text-center card-helper" @click="openHelperPopup(helper)">
            <img :src="helper.AvatarUrl || 'https://via.placeholder.com/150'" class="card-img-top" alt="Helper Image" />
            <div class="card-body">
              <h5 class="card-title">{{ helper.FullName }}</h5>
              <p class="card-text">Phone: {{ helper.PhoneNumber }}</p>
              <p class="card-text">Rating: {{ helper.AverageRating.toFixed(1) }} ⭐</p>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="totalHelperPages > 1">
        <button @click="changeHelperPage(helperPage - 1)" :disabled="helperPage === 1">Previous</button>
        <span>Page {{ helperPage }} of {{ totalHelperPages }}</span>
        <button @click="changeHelperPage(helperPage + 1)" :disabled="helperPage === totalHelperPages">Next</button>
      </div>
    </div>

    <!-- Bộ lọc Availability -->
    <div class="container my-4">
      <h3>Filter Availabilities</h3>
      <div class="filters">
        <input v-model="filters.date" type="date" placeholder="Date" />
        <select v-model="filters.session">
          <option value="">Select Session</option>
          <option value="session1">Session 1 (7:00 - 12:00)</option>
          <option value="session2">Session 2 (13:00 - 17:00)</option>
          <option value="fullDay">Full Day (7:00 - 17:00)</option>
        </select>
        <input v-model="filters.minPrice" type="number" placeholder="Min Price" />
        <input v-model="filters.maxPrice" type="number" placeholder="Max Price" />
        <button @click="fetchAvailabilities">Filter</button>
      </div>

      <!-- Kết quả lọc (danh sách Availability) -->
      <div class="row">
        <div v-for="availability in availabilities" :key="availability.AvailabilityID" class="col-md-3 mb-4">
          <div class="card text-center card-availability" @click="openAvailabilityPopup(availability)">
            <div class="card-body">
              <h5 class="card-title">{{ availability.HelperName }}</h5>
              <p class="card-text">Date: {{ availability.Date }}</p>
              <p class="card-text">Time: {{ availability.StartTime }} - {{ availability.EndTime }}</p>
              <p class="card-text">Price: ${{ availability.Price.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="totalAvailabilityPages > 1">
        <button @click="changeAvailabilityPage(availabilityPage - 1)" :disabled="availabilityPage === 1">Previous</button>
        <span>Page {{ availabilityPage }} of {{ totalAvailabilityPages }}</span>
        <button @click="changeAvailabilityPage(availabilityPage + 1)" :disabled="availabilityPage === totalAvailabilityPages">Next</button>
      </div>
    </div>

    <!-- Popup chọn ngày và buổi cho Helper -->
    <div
      class="modal fade"
      id="helperPopup"
      tabindex="-1"
      aria-labelledby="helperPopupTitle"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="helperPopupTitle">Book Helper: {{ selectedHelper?.FullName }}</h5>
            <button type="button" class="btn-close" @click="closeHelperPopup"></button>
          </div>
          <div class="modal-body">
            <div class="container-fluid">
              <div class="row">
                <!-- Bên trái: Lịch -->
                <div class="col-md-8 page-left d-flex flex-column align-items-center">
                  <h6>Select Dates</h6>
                  <div class="mb-3">
                    <VCalendar
                      :columns="columns"
                      :expanded="expanded"
                      :color="selectedColor"
                      :attributes="[...allowedDates, ...datesPicked]"
                      :disabled-dates="allDisabledDates"
                      :min-date="minDate"
                      :max-date="maxDate"
                      initial-page="initial_page"
                      :key="initial_page.month + '-' + initial_page.year"
                      v-model="selectedDates"
                      @dayclick="handleDayClick"
                      @drag="handleDrag"
                      borderless
                      is-required
                    />
                  </div>

                  <!-- Chọn buổi -->
                  <div v-if="selectedDates.length" class="d-flex flex-column justify-content-start" style="width: 70%">
                    <h6>Select Session</h6>
                    <div class="mb-3 d-flex">
                      <div class="dropdown">
                        <button
                          class="btn btn-light dropdown-toggle"
                          type="button"
                          id="sessionDropdown"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          {{ selectedSession || 'Select Session' }}
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="sessionDropdown">
                          <li><a class="dropdown-item" href="#" @click.prevent="selectSession('session1')">Session 1 (7:00 - 12:00)</a></li>
                          <li><a class="dropdown-item" href="#" @click.prevent="selectSession('session2')">Session 2 (13:00 - 17:00)</a></li>
                          <li><a class="dropdown-item" href="#" @click.prevent="selectSession('fullDay')">Full Day (7:00 - 17:00)</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bên phải: Thông tin Helper -->
                <div class="col-md-4">
                  <h6>Helper Information</h6>
                  <img :src="selectedHelper?.AvatarUrl || 'https://via.placeholder.com/150'" class="img-fluid mb-3" alt="Helper Image" />
                  <p><strong>Name:</strong> {{ selectedHelper?.FullName }}</p>
                  <p><strong>Phone:</strong> {{ selectedHelper?.PhoneNumber }}</p>
                  <p><strong>Rating:</strong> {{ selectedHelper?.AverageRating.toFixed(1) }} ⭐</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeHelperPopup">Cancel</button>
            <button type="button" class="btn btn-primary" @click="createBookingFromHelper">Book Now</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup xác nhận đặt lịch từ Availability -->
    <div
      class="modal fade"
      id="availabilityPopup"
      tabindex="-1"
      aria-labelledby="availabilityPopupTitle"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="availabilityPopupTitle">Confirm Booking</h5>
            <button type="button" class="btn-close" @click="closeAvailabilityPopup"></button>
          </div>
          <div class="modal-body">
            <p>Do you want to book this availability?</p>
            <p><strong>Helper:</strong> {{ selectedAvailability?.HelperName }}</p>
            <p><strong>Date:</strong> {{ selectedAvailability?.Date }}</p>
            <p><strong>Time:</strong> {{ selectedAvailability?.StartTime }} - {{ selectedAvailability?.EndTime }}</p>
            <p><strong>Price:</strong> ${{ selectedAvailability?.Price.toFixed(2) }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAvailabilityPopup">No</button>
            <button type="button" class="btn btn-primary" @click="createBookingFromAvailability">Yes</button>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>
  </div>
</template>

<script setup>
import Navigate from '@/components/Navigate.vue';
import HeroSection from '@/components/HeroSection.vue';
import Footer from '@/components/Footer.vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useScreens } from 'vue-screen-utils';
import axios from 'axios';
import { format } from 'date-fns';

// Dữ liệu và trạng thái
const searchName = ref('');
const helpers = ref([]);
const helperPage = ref(1);
const helperLimit = ref(10);
const totalHelperPages = ref(0);

const filters = reactive({
  date: '',
  session: '',
  minPrice: '',
  maxPrice: '',
});
const availabilities = ref([]);
const availabilityPage = ref(1);
const availabilityLimit = ref(10);
const totalAvailabilityPages = ref(0);

const selectedHelper = ref(null);
const selectedAvailability = ref(null);
const selectedDates = ref([]);
const selectedSession = ref(null);

const user = ref(null);

// Cấu hình lịch
const { mapCurrent } = useScreens({
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
});
const columns = mapCurrent({ lg: 2 }, 1);
const expanded = mapCurrent({ lg: false }, true);
const selectedColor = ref('blue');

const minDate = ref(new Date());
const maxDate = ref(new Date(new Date().setMonth(new Date().getMonth() + 1)));
const allDisabledDates = ref([]);
const allAvailableDates = ref([]);
const allowedDates = computed(() => {
  return allAvailableDates.value.map((date) => ({
    key: `allowed-${date}`,
    dates: date,
    highlight: {
      color: 'blue',
      fillMode: 'outline',
      contentClass: 'italic',
    },
  }));
});
const datesPicked = computed(() => {
  if (selectedDates.value.length > 0) {
    return [
      {
        dates: {
          start: selectedDates.value[0],
          end: selectedDates.value[selectedDates.value.length - 1],
        },
        highlight: 'blue',
      },
    ];
  }
  return [];
});

const initial_page = ref({ month: new Date().getMonth(), year: new Date().getFullYear() });

// Hàm fetch dữ liệu
const fetchHelpers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/helpers/search', {
      params: {
        name: searchName.value,
        page: helperPage.value,
        limit: helperLimit.value,
      },
    });
    helpers.value = response.data.helpers;
    totalHelperPages.value = response.data.totalPages;
  } catch (error) {
    alert('Error fetching helpers: ' + error.response.data.message);
  }
};

const fetchAvailabilities = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/availabilities', {
      params: {
        date: filters.date,
        session: filters.session,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        page: availabilityPage.value,
        limit: availabilityLimit.value,
      },
    });
    availabilities.value = response.data.availabilities;
    totalAvailabilityPages.value = response.data.totalPages;
  } catch (error) {
    alert('Error fetching availabilities: ' + error.response.data.message);
  }
};

const fetchHelperAvailability = async (helperId) => {
  try {
    const response = await axios.get('http://localhost:3000/api/availabilities', {
      params: {
        helperId: helperId,
        page: 1,
        limit: 1000, // Lấy tất cả để hiển thị trên lịch
      },
    });
    const availableDates = response.data.availabilities
      .filter((a) => a.Status === 'Available')
      .map((a) => new Date(a.Date));
    allAvailableDates.value = availableDates;

    // Tính các ngày bị vô hiệu hóa
    allDisabledDates.value = [];
    for (let d = new Date(minDate.value); d <= maxDate.value; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      if (
        currentDate < new Date() || // Ngày đã qua
        !availableDates.some((ad) => ad.toDateString() === currentDate.toDateString())
      ) {
        allDisabledDates.value.push(currentDate);
      }
    }
  } catch (error) {
    alert('Error fetching helper availability: ' + error.response.data.message);
  }
};

// Quản lý popup
const openHelperPopup = (helper) => {
  selectedHelper.value = helper;
  selectedDates.value = [];
  selectedSession.value = null;
  fetchHelperAvailability(helper.HelperID);
  const modal = new bootstrap.Modal(document.getElementById('helperPopup'));
  modal.show();
};

const closeHelperPopup = () => {
  const modal = bootstrap.Modal.getInstance(document.getElementById('helperPopup'));
  modal.hide();
};

const openAvailabilityPopup = (availability) => {
  selectedAvailability.value = availability;
  const modal = new bootstrap.Modal(document.getElementById('availabilityPopup'));
  modal.show();
};

const closeAvailabilityPopup = () => {
  const modal = bootstrap.Modal.getInstance(document.getElementById('availabilityPopup'));
  modal.hide();
};

// Xử lý lịch
const handleDayClick = (event) => {
  const date = new Date(event.date);
  if (selectedDates.value.length === 0 || selectedDates.value.length >= 7) {
    selectedDates.value = [date];
  } else {
    const lastDate = selectedDates.value[selectedDates.value.length - 1];
    const diffDays = Math.abs((date - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      const newDates = [];
      const start = lastDate < date ? lastDate : date;
      const end = lastDate < date ? date : lastDate;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        newDates.push(new Date(d));
      }
      selectedDates.value = newDates.filter((d) =>
        allAvailableDates.value.some((ad) => ad.toDateString() === d.toDateString())
      );
      if (selectedDates.value.length > 7) {
        selectedDates.value = selectedDates.value.slice(0, 7);
      }
    } else {
      selectedDates.value = [date];
    }
  }
};

const handleDrag = (event) => {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const newDates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    newDates.push(new Date(d));
  }
  selectedDates.value = newDates.filter((d) =>
    allAvailableDates.value.some((ad) => ad.toDateString() === d.toDateString())
  );
  if (selectedDates.value.length > 7) {
    selectedDates.value = selectedDates.value.slice(0, 7);
  }
};

const selectSession = (session) => {
  selectedSession.value = session;
};

// Tạo booking
const createBookingFromHelper = async () => {
  if (!selectedDates.value.length || !selectedSession.value) {
    alert('Please select dates and session.');
    return;
  }

  try {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      alert('Please log in to book a helper.');
      return;
    }

    for (const date of selectedDates.value) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      let startTime, endTime;
      if (selectedSession.value === 'session1') {
        startTime = '07:00:00';
        endTime = '12:00:00';
      } else if (selectedSession.value === 'session2') {
        startTime = '13:00:00';
        endTime = '17:00:00';
      } else {
        startTime = '07:00:00';
        endTime = '17:00:00';
      }

      const response = await axios.post('http://localhost:3000/api/bookings', {
        UserID: userData.UserID,
        HelperID: selectedHelper.value.HelperID,
        StartTime: `${formattedDate} ${startTime}`,
        EndTime: `${formattedDate} ${endTime}`,
      });

      if (response.status === 201) {
        alert('Booking created successfully for ' + formattedDate);
      }
    }
    closeHelperPopup();
  } catch (error) {
    alert('Error creating booking: ' + error.response.data.message);
  }
};

const createBookingFromAvailability = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      alert('Please log in to book a helper.');
      return;
    }

    const response = await axios.post('http://localhost:3000/api/bookings', {
      UserID: userData.UserID,
      HelperID: selectedAvailability.value.HelperID,
      StartTime: `${selectedAvailability.value.Date} ${selectedAvailability.value.StartTime}`,
      EndTime: `${selectedAvailability.value.Date} ${selectedAvailability.value.EndTime}`,
    });

    if (response.status === 201) {
      alert('Booking created successfully!');
      closeAvailabilityPopup();
      fetchAvailabilities();
    }
  } catch (error) {
    alert('Error creating booking: ' + error.response.data.message);
  }
};

// Phân trang
const changeHelperPage = (newPage) => {
  helperPage.value = newPage;
  fetchHelpers();
};

const changeAvailabilityPage = (newPage) => {
  availabilityPage.value = newPage;
  fetchAvailabilities();
};

// Lấy thông tin user
const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    user.value = userData;
  }
};

// Khởi tạo
onMounted(() => {
  fetchUser();
  fetchHelpers();
  fetchAvailabilities();
});
</script>

<style scoped>
.herosection {
  height: 450px;
  overflow: hidden;
}

.card-helper,
.card-availability {
  cursor: pointer;
  width: 100%;
  padding: 20px;
  background: white;
  border: 1px solid #ccc;
  transition: transform 0.2s;
}

.card-helper:hover,
.card-availability:hover {
  transform: scale(1.05);
}

.card-img-top {
  height: 150px;
  object-fit: cover;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters input,
.filters select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.filters button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filters button:hover {
  background-color: #0056b3;
}

.pagination {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.pagination button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.modal .modal-content {
  border-radius: 10px;
}

.page-left {
  overflow-y: auto;
  max-height: 500px;
}

.page-left::-webkit-scrollbar {
  width: 8px;
}

.page-left::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 4px;
}

.page-left::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

.page-left::-webkit-scrollbar-track {
  background: #f1f1f1;
}
</style>