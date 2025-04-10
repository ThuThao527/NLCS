<template>
  <div>
    <p class="d-inline-flex gap-1">
      <button
        class="btn btn-primary"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseExample"
        aria-expanded="false"
        aria-controls="collapseExample"
      >
        <i class="bx bx-filter-alt"></i>
        Filter
      </button>
    </p>
    <div class="collapse" id="collapseExample">
      <div class="card card-body">
        <div class="input-group mb-3 col">
          <span class="input-group-text"> Search by Tour Name</span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Finding by name of tour..."
          />
        </div>
        <div class="form-floating col">
          <select
            v-model="Filter.TourID"
            class="form-select"
            id="floatingSelect"
            aria-label="Floating label select example"
          >
            <option value="">All</option>
            <option
              v-for="(item, index) in tourNameList"
              :key="index"
              :value="item.TourID"
            >
              {{ item.TourName }}
            </option>
          </select>
          <label for="floatingSelect">Select Tour</label>
        </div>
      </div>
    </div>

    <div v-for="tour in filteredTours" :key="tour.TourID" class="mb-4">
      <h4 class="text-center">{{ tour.TourName }}</h4>
      <div
        v-for="(schedule, index) in tour.schedules"
        :key="index"
        class="card mb-3"
      >
        <button
          class="btn btn-primary card-header bg-primary text-white text-center"
          type="button"
          @click="toggleParticipants(tour.TourID, schedule.ScheduleID)"
        >
          Date: {{ schedule.StartDate }} - {{ schedule.EndDate }}
        </button>

        <div
          v-show="expandedSchedule === `${tour.TourID}-${schedule.ScheduleID}`"
        >
          <table class="table table-bordered table-hover table-sm">
            <thead class="table-light">
              <tr>
                <th class="fw-bold">#</th>
                <th class="fw-bold">Full Name</th>
                <th class="fw-bold">Date of Birth</th>
                <th class="fw-bold">Gender</th>
                <th class="fw-bold">Email</th>
                <th class="fw-bold">PhoneNumber</th>
                <th class="fw-bold">Full Name on Passport</th>
                <th class="fw-bold">Passport Number</th>
                <th class="fw-bold">Nationality</th>
                <th class="fw-bold">Booked Services</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="
                  loadingSchedule === `${tour.TourID}-${schedule.ScheduleID}`
                "
              >
                <td colspan="10" class="text-center">Loading...</td>
              </tr>

              <template
                v-for="(bookingPackage, bookingPackageIndex) in participants[
                  `${tour.TourID}-${schedule.ScheduleID}`
                ]
                  ? Object.values(
                      participants[`${tour.TourID}-${schedule.ScheduleID}`]
                    )
                  : []"
              >
                <!-- Lặp qua từng participant trong nhóm -->
                <tr
                  v-for="(participant, index) in bookingPackage.items"
                  :key="`participant-${bookingPackageIndex}-${index}`"
                  :class="
                    (index === 0 ? 'text-danger ' : '',
                    getColor(bookingPackageIndex, participant.Status))
                  "
                >
                  <td>
                    {{ index + 1 }}
                  </td>
                  <td :class="index === 0 ? 'text-danger' : ''">
                    {{ participant.FullName }}

                    <i
                      class="bx bx-money text-success fs-5"
                      v-if="(participant.Status === 'Paid') & (index === 0)"
                    ></i>
                  </td>
                  <td>{{ formatDate(participant.DateOfBirth) }}</td>
                  <td>{{ participant.Gender }}</td>
                  <td>{{ participant.Email }}</td>
                  <td>{{ participant.PhoneNumber }}</td>
                  <td>{{ participant.FullNameOnPassport }}</td>
                  <td>{{ participant.PassportNumber }}</td>
                  <td>{{ participant.Nationality }}</td>
                  <td v-if="index === 0" :rowspan="bookingPackage.items.length">
                    {{
                      bookingPackage.services && index === 0
                        ? bookingPackage.services
                            .map(
                              (service) =>
                                `(${service.Quantity}) - ${service.ServiceName}`
                            )
                            .join(', ')
                        : ''
                    }}
                  </td>
                </tr>
              </template>

              <tr
                v-if="
                  participants[`${tour.TourID}-${schedule.ScheduleID}`] &&
                  participants[`${tour.TourID}-${schedule.ScheduleID}`]
                    .length === 0
                "
              >
                <td colspan="10" class="text-center">No data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <hr />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import { toRaw } from 'vue';

const tours = ref([]);
const searchQuery = ref('');

const expandedSchedule = ref(null);
const participants = ref([{}]);
const loadingSchedule = ref(null);
const tourNameList = ref([]);

const Filter = reactive({
  StartDate: '',
  EndDate: '',
  TourID: '',
  Status: '',
  TourName: '', // Thêm trường mới
  BookingID: '',
});

// Lấy màu từ danh sách sách màu sắc
const getColor = (index, status) => {
  if (status == 'Cancelled') return 'table-danger';
  const colors = ['table-light', 'table-secondary'];
  return colors[index % colors.length]; // Lặp lại màu nếu hết danh sách
};

// Hàm tải danh sách tour
const fetchTours = async () => {
  try {
    const { data } = await axios.get('/api/tour');
    tourNameList.value = data.reduce((acc, tourName) => [...acc, tourName], []);

    console.log('tourName: ', tourNameList);
    return data.reverse();
  } catch (error) {
    console.error('Lỗi khi tải danh sách tour:', error);
    return [];
  }
};

// Hàm tải danh sách lịch trình của tour
const fetchTourSchedule = async (tourId) => {
  try {
    const { data } = await axios.get(`/api/tour/${tourId}/schedule`);
    console.log(data);
    return data.map((item) => ({
      ...item,
      StartDate: formatDate(item.StartDate),
      EndDate: formatDate(
        new Date(item.StartDate).setDate(
          new Date(item.StartDate).getDate() + item.Duration - 1
        )
      ),
    }));
  } catch (error) {
    console.error('Lỗi khi tải lịch trình:', error);
    return [];
  }
};

// Lọc danh sách tour theo tên
const removeDiacritics = (str) => {
  return str
    ? str
        .normalize('NFD') // Chuyển thành dạng Unicode tổ hợp
        .replace(/[\u0300-\u036f]/g, '')
    : ''; // Xóa dấu tiếng Việt
};

const filteredTours = computed(() => {
  if (Filter.TourID) {
    return tours.value.filter((tour) => tour.TourID === Filter.TourID);
  } else {
    const query = removeDiacritics(searchQuery.value.toLowerCase()).trim();
    console.log(tours.value);
    return tours.value.filter((tour) => {
      const tourName = removeDiacritics(
        tour.TourName ? tour.TourName.toLowerCase() : tour.TourName
      );

      // Kiểm tra nếu toàn bộ query nằm trong tên tour
      if (tourName.includes(query)) return true;

      // Tách query thành các từ nhỏ hơn
      const queryWords = query.split(' ');
      const tourWords = tourName.split(' ');

      // Kiểm tra nếu mọi từ trong query đều có trong tên tour
      return queryWords.every((q) =>
        tourWords.some((word) => word.includes(q))
      );
    });
  }
});

// Hàm lấy danh sách người tham gia theo schedule
const fetchParticipants = async (tourId, scheduleId) => {
  const key = `${tourId}-${scheduleId}`;
  loadingSchedule.value = key;
  try {
    const { data } = await axios.get(
      `/api/participant/${tourId}/${scheduleId}`
    );
    //Chuyển mảng đối tượng về đối tượng với key là bookingId
    participants.value[key] = data.reduce((acc, item) => {
      const bookingId = item.BookingID;

      // Kiểm tra xem booking đã có trong acc chưa
      if (!acc[bookingId]) {
        acc[bookingId] = {
          items: [], // Dùng mảng thay vì Object
        };
      }

      // Thêm item vào mảng items
      acc[bookingId].items.push(item);

      return acc;
    }, {});
    console.log(toRaw(participants.value[key]));

    const objects = await Promise.all(
      Object.keys(participants.value[key]).map(async (bookingId) => {
        const services = await bookedServices(bookingId);
        participants.value[key][bookingId] = {
          items: toRaw(participants.value[key][bookingId].items),
          services,
        };
      })
    );

    console.log(participants.value[key]);
  } catch (error) {
    console.error('Lỗi khi tải danh sách người tham gia:', error);
    participants.value[key] = [];
  }
  loadingSchedule.value = null;
};

// Khi người dùng click vào schedule
const toggleParticipants = async (tourId, scheduleId) => {
  const key = `${tourId}-${scheduleId}`;
  if (expandedSchedule.value === key) {
    expandedSchedule.value = null;
  } else {
    expandedSchedule.value = key;
    if (!participants.value[key]) {
      await fetchParticipants(tourId, scheduleId);
    }
  }
};

// Định dạng ngày tháng
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const bookedServices = async (bookingId) => {
  try {
    const response = await axios.get(`/api/booked_service/${bookingId}`);
    return response.data;
  } catch (error) {
    console.log('Error bookedServices', error);
  }
};

// Tải dữ liệu ban đầu
onMounted(async () => {
  const tourList = await fetchTours();
  tours.value = await Promise.all(
    tourList.map(async (tour) => ({
      ...tour,
      schedules: await fetchTourSchedule(tour.TourID),
    }))
  );
});
</script>

<style scoped>
.card-header {
  font-weight: bold;
}
</style>
