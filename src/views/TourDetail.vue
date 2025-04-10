<template>
  <div class="body">
    <!-- <header>
      <Navigate class="navigate"></Navigate>
      <div class="herosection">
        <HeroSection
          image="https://media.istockphoto.com/id/488876192/vi/anh/hoi-an-vietnam.jpg?s=2048x2048&w=is&k=20&c=i9PyzEChi5gMuB4Jf1HAzOmdEmY28_Bo3aBVx0tJb3Q="
          p1="14 Days - Da Nang to Hoi An"
          p2=""
        ></HeroSection>
      </div>
    </header> -->
    <div class="card-box">
      <div class="card text-center card-booking">
        <h1 class="Card-title">${{ parseFloat(tour.Price).toFixed(2) }}</h1>
        <h6>deposit ${{ parseFloat(tour.Price * 0.3).toFixed(2) }}</h6>
        <hr />
        <div class="btn btn-success" @click="openPopup">Book Now</div>
        <hr />
        <router-link class="btn btn-info">Ask a question</router-link>
      </div>
    </div>

    <main>
      <!-- Popup -->
      <div
        class="modal fade"
        id="bookingPopup"
        tabindex="-1"
        aria-labelledby="popupTitle"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="popupTitle">Discover Vietnam</h5>
              <button
                type="button"
                class="btn-close"
                @click="closePopup"
              ></button>
            </div>
            <div class="breadcrumb">
              <span
                class="breadcrumb-item"
                :class="{ active: currentStep === 1 }"
              >
                Choose a Package
              </span>
              <span class="breadcrumb-separator">&gt;</span>
              <span
                class="breadcrumb-item"
                :class="{ active: currentStep === 2 }"
              >
                Add Participant Info
              </span>
              <span class="breadcrumb-separator">&gt;</span>
              <span
                class="breadcrumb-item"
                :class="{ active: currentStep === 3 }"
              >
                Complete Payment
              </span>
            </div>
            <div class="modal-body">
              <div class="container-fluid">
                <div class="row">
                  <div v-if="currentStep === 1" class="col-md-8 page-left">
                    <h6>Select Departure</h6>
                    <div class="mb-3">
                      <!-- Lịch hiển thị toàn bộ calendar -->
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
                        v-model="selectedDate"
                        @dayclick="
                          removeSevenDaysAfterSelectedDate($event.date)
                        "
                        borderless
                        is-required
                      />
                    </div>

                    <h6>Package</h6>
                    <div class="mb-3 d-flex">
                      <div class="dropdown">
                        <button
                          class="btn btn-light dropdown-toggle"
                          type="button"
                          id="dropdownMenuButton"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i class="bi bi-person"></i> {{ selectedPakage }}
                        </button>
                        <ul
                          class="dropdown-menu"
                          aria-labelledby="dropdownMenuButton"
                        >
                          <li
                            v-for="value in caculateMount(
                              getSchedule(selectedDate)?.AvailableSpots
                            )"
                            :key="value"
                          >
                            <a
                              class="dropdown-item"
                              href="#"
                              @click.prevent="_selectPackage(value)"
                            >
                              {{ value }}
                            </a>
                          </li>
                        </ul>
                      </div>

                      <h6 style="margin-left: 20%">
                        Trip Price: <strong>${{ tour.Price }}</strong>
                      </h6>
                    </div>

                    <h6>Select Options</h6>
                    <div
                      class="form-check px-0"
                      v-for="(items, status) in groupedServices()"
                      :key="status"
                    >
                      <div v-if="status != 'Available'">
                        <div v-for="(option, index) in items" :key="index">
                          <div class="row">
                            <div class="col-2">
                              <div class="dropdown">
                                <button
                                  class="btn btn-light dropdown-toggle"
                                  type="button"
                                  id="dropdownMenuButton"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  style="width: fit-content"
                                >
                                  {{
                                    selectedOptions[option.ServiceID]
                                      ?.Quantity || 0
                                  }}
                                </button>
                                <ul
                                  class="dropdown-menu"
                                  aria-labelledby="dropdownMenuButton"
                                >
                                  <li
                                    v-for="value in caculateMount(
                                      option.Capacity
                                    )"
                                    :key="value"
                                  >
                                    <a
                                      class="dropdown-item"
                                      href="#"
                                      @click.prevent="
                                        selectOption(option.ServiceID, value)
                                      "
                                    >
                                      {{ value }}
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <div class="col">
                              <div class="d-flex flex-column">
                                <div class="d-flex">
                                  <h5>
                                    {{ option.ServiceName }}
                                  </h5>
                                  <h5 style="margin-left: auto">
                                    ${{ option.Price }}
                                  </h5>
                                </div>
                                <div>
                                  {{ option.Description }}
                                </div>
                              </div>
                              <hr />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="currentStep === 2" class="col-md-8 page-left">
                    <h6>Buyer Information</h6>
                    <div>
                      <div class="row g-3">
                        <div class="col-6">
                          <label for="" class="form-label">First Name</label>
                          <input
                            v-model="Buyer.firstName"
                            type="text"
                            class="form-control"
                            placeholder="First Name"
                            required
                          />
                        </div>
                        <div class="col-6">
                          <label for="" class="form-label">Last Name</label>
                          <input
                            v-model="Buyer.lastName"
                            type="text"
                            class="form-control"
                            placeholder="Last Name"
                            required
                          />
                        </div>
                        <div class="col-6">
                          <label for="" class="form-label">Email</label>
                          <input
                            v-model="Buyer.email"
                            type="email"
                            class="form-control"
                            placeholder="Email"
                            required
                          />
                        </div>
                        <div class="col-6">
                          <label for="" class="form-label">Confirm Email</label>
                          <input
                            v-model="Buyer.confirmEmail"
                            type="email"
                            class="form-control"
                            placeholder="Confirm Email"
                            required
                          />
                        </div>
                        <div class="col">
                          <label for="" class="form-label">Phone Number</label>
                          <input
                            v-model="Buyer.phoneNumber"
                            type="text"
                            class="form-control"
                            placeholder="Your Answer"
                            required
                          />
                        </div>
                        <hr />
                      </div>
                      <div>
                        <h6>Participant Information</h6>
                        <div v-for="(part, index) in Participant" :key="index">
                          <h5
                            class="bg-secondary rounded-circle text-center text-white"
                            style="width: 30px; height: 30px"
                          >
                            {{ index + 1 }}
                          </h5>
                          <div>
                            <div class="row g-3">
                              <div class="col-6">
                                <label for="" class="form-label"
                                  >First Name</label
                                >
                                <input
                                  v-model="part.firstName"
                                  type="text"
                                  class="form-control"
                                  placeholder="First Name"
                                  required
                                />
                              </div>
                              <div class="col-6">
                                <label for="" class="form-label"
                                  >Last Name</label
                                >
                                <input
                                  v-model="part.lastName"
                                  type="text"
                                  class="form-control"
                                  placeholder="Last Name"
                                  required
                                />
                              </div>
                              <div class="col-12">
                                <label for="" class="form-label"
                                  >Date of Birth
                                </label>
                                <VDatePicker
                                  v-model="part.dateOfBirth"
                                  :popover="popover"
                                >
                                  <template
                                    #default="{ inputValue, inputEvents }"
                                  >
                                    <input
                                      class="form-control"
                                      :value="inputValue"
                                      v-on="inputEvents"
                                    />
                                  </template>
                                </VDatePicker>
                              </div>
                              <div class="col">
                                <label for="" class="form-label">Email</label>
                                <input
                                  v-model="part.email"
                                  type="email"
                                  class="form-control"
                                  placeholder="Email"
                                  required
                                />
                              </div>
                            </div>
                            <div class="my-1">
                              <label
                                for="inputNameOnPassport"
                                class="form-label m-1"
                                >Full Name On Passport</label
                              >
                              <input
                                id="inputNameOnPassport"
                                v-model="part.fullNameOnPassport"
                                type="text"
                                class="form-control"
                                placeholder="Your Answer"
                                required
                              />
                            </div>
                            <div class="my-1">
                              <label
                                for="inputPassportNumber"
                                class="form-label m-1"
                                >Passport Number</label
                              >
                              <input
                                id="inputPassportNumber"
                                v-model="part.passportNumber"
                                type="number"
                                class="form-control"
                                placeholder="Your Answer"
                                required
                              />
                            </div>
                            <div class="my-1">
                              <label for="gender" class="form-label m-1"
                                >Gender</label
                              >
                              <div class="form-check">
                                <input
                                  type="radio"
                                  class="form-check-input"
                                  id="male"
                                  v-model="part.gender"
                                  value="male"
                                />
                                <label for="male" class="form-check-label"
                                  >Male</label
                                >
                              </div>
                              <div class="form-check">
                                <input
                                  type="radio"
                                  class="form-check-input"
                                  id="female"
                                  v-model="part.gender"
                                  value="female"
                                />
                                <label for="female" class="form-check-label"
                                  >Female</label
                                >
                              </div>
                            </div>
                            <div class="my-1">
                              <label
                                for="inputNationality"
                                class="form-label m-1"
                                >Nationality</label
                              >
                              <input
                                id="inputNationality"
                                v-model="part.nationality"
                                type="text"
                                class="form-control"
                                placeholder="Your Answer"
                                required
                              />
                            </div>
                            <div class="my-1">
                              <label
                                for="inputPhoneNumber"
                                class="form-label m-1"
                                >Phone Number</label
                              >
                              <input
                                id="inputPhoneNumber"
                                v-model="part.phoneNumber"
                                type="text"
                                class="form-control"
                                placeholder="Your Answer"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Add participant form here -->
                  </div>
                  <!-- <div v-else-if="currentStep === 3" class="col-md-8 page-left">
                    <h6>Payment</h6>
                    <form>
                      <div class="mb-3">
                        <label for="cardNumber" class="form-label"
                          >Card number</label
                        >
                        <input
                          type="text"
                          class="form-control"
                          id="cardNumber"
                          placeholder="1234 1234 1234 1234"
                          v-model="payment.cardNumber"
                        />
                      </div>
                      <div class="row mb-3">
                        <div class="col-md-6">
                          <label for="expirationDate" class="form-label"
                            >Expiration date</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="expirationDate"
                            placeholder="MM / YY"
                            v-model="payment.expirationDate"
                          />
                        </div>
                        <div class="col-md-6">
                          <label for="cvc" class="form-label"
                            >Security code</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="cvc"
                            placeholder="CVC"
                            v-model="payment.cvc"
                          />
                        </div>
                      </div>
                      <h5>Billing Address</h5>
                      <div class="mb-3">
                        <label for="nameOnCard" class="form-label"
                          >Name on Card</label
                        >
                        <input
                          type="text"
                          class="form-control"
                          id="nameOnCard"
                          placeholder="Name on Card"
                          v-model="payment.nameOnCard"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="addressLine1" class="form-label"
                          >Address Line 1</label
                        >
                        <input
                          type="text"
                          class="form-control"
                          id="addressLine1"
                          placeholder="Address Line 1"
                          v-model="payment.addressLine1"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="addressLine2" class="form-label"
                          >Address Line 2</label
                        >
                        <input
                          type="text"
                          class="form-control"
                          id="addressLine2"
                          placeholder="Address Line 2"
                          v-model="payment.addressLine2"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="city" class="form-label">City / Town</label>
                        <input
                          type="text"
                          class="form-control"
                          id="city"
                          placeholder="City / Town"
                          v-model="payment.city"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="postcode" class="form-label"
                          >Postcode</label
                        >
                        <input
                          type="text"
                          class="form-control"
                          id="postcode"
                          placeholder="Postcode"
                          v-model="payment.postcode"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="country" class="form-label">Country</label>
                        <select class="form-select" v-model="payment.country">
                          <option value="Vietnam">Vietnam</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Japan">Japan</option>
                        </select>
                      </div>
                    </form>
                  </div> -->

                  <div class="col-md-4">
                    <h6>Your Booking</h6>
                    <div>
                      <div class="d-flex">
                        <h6 class="text-bold">Trip Price:</h6>
                        <h6 style="margin-left: auto">
                          ${{ tour.Price * selectedPakage }}
                        </h6>
                      </div>

                      <span style="font-size: small; margin-left: 10px"
                        >${{ tour.Price }} * {{ selectedPakage }}</span
                      >
                    </div>
                    <hr />

                    <div v-if="Object.keys(selectedOptions).length > 0">
                      <div
                        class="my-2"
                        v-for="(optionData, optionId) in selectedOptions"
                        :key="optionId"
                      >
                        <div class="d-flex">
                          <h6 class="text-bold" style="margin-bottom: 0">
                            {{ optionData.ServiceName }}
                          </h6>
                          <h6 style="margin-left: auto; margin-bottom: 0">
                            ${{ optionData.Price * optionData.Quantity }}
                          </h6>
                        </div>

                        <span
                          style="
                            font-size: small;
                            margin-left: 10px;
                            margin-bottom: 15px;
                          "
                        >
                          ${{ optionData.Price }} * {{ optionData.Quantity }}
                        </span>
                      </div>
                      <hr />
                    </div>

                    <!-- <p>Total: ${{ calculateTotal() }}</p> -->
                    <p>Trip Total: ${{ calculateTotal() }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="goBack">
                {{ currentStep > 1 ? 'Back' : 'Close' }}
              </button>
              <button type="submit" class="btn btn-primary" @click="goNext">
                {{ currentStep === 3 ? 'Confirm Booking' : 'Continue' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Tour_Information
        :Schedules="schedules"
        :Tour="tour"
        :Services="services"
        :Itineraries="itineraries"
      ></Tour_Information>
      <Footer></Footer>
    </main>
  </div>
</template>

<script setup>
import Tour_Information from '@/components/Tour_Information.vue';
import { computed, onMounted, reactive, ref, watch, toRefs } from 'vue';
import { useScreens } from 'vue-screen-utils';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import axios, { all } from 'axios';
import { format } from 'date-fns';

const route = useRoute();
const schedules = ref([]); // Lưu trữ các lịch trình của tour
const tour = ref({}); // Lưu thông tin của tour
const services = ref([]); // Lưu các services của tour
const currentStep = ref(1); // Lưu bước hiện tại của việc đặt tour
const user = ref(); // Lưu thông tin của người dùng hiện tại

const { mapCurrent } = useScreens({
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
});
const columns = mapCurrent({ lg: 2 }, 1);
const expanded = mapCurrent({ lg: false }, true);
const selectedColor = ref('blue');
const attrs = ref([
  {
    key: 'test',
    highlight: true,
    dates: { start: new Date(2019, 3, 15), end: new Date(2019, 3, 19) },
    // dates: new Date(),
  },
]);

var minDate = ref();
var maxDate = ref();

var allDisabledDates = ref([]);
var allAvailableDates = ref([]);
// Tính toán các ngày được phép
const allowedDates = computed(() => {
  return schedules.value.map((date) => ({
    key: `allowed-${date.StartDate}`,
    dates: date.StartDate,
    highlight: {
      color: 'blue',
      fillMode: 'outline',
      contentClass: 'italic',
    },
  }));
});

const datesPicked = computed(() => {
  if (allAvailableDates.value != null && allAvailableDates.value.length > 0) {
    return [
      {
        dates: {
          start: allAvailableDates.value[0],
          end: allAvailableDates.value[allAvailableDates.value.length - 1],
        },
        highlight: 'blue',
      },
    ];
  }
  return [];
});

// Cấu hình các ngày bị disable
const disabledDates = async () => {
  // Tạo một mảng chứa tất cả các ngày cần vô hiệu hóa

  for (
    let d = new Date(minDate.value);
    d <= maxDate.value;
    d.setDate(d.getDate() + 1)
  ) {
    let currentDate = new Date(d);
    // Kiểm tra xem ngày hiện tại có nằm trong danh sách các ngày được phép không
    if (
      !schedules.value.some(
        (schedule) =>
          new Date(schedule.StartDate).toDateString() ===
          currentDate.toDateString()
      )
    ) {
      allDisabledDates.value.push(currentDate);
      // Loại bỏ giá trị trùng lặp
      // allDisabledDates = [...new Set(allDisabledDates)];
    }
  }
};

const selectedDate = ref();
const initial_page = ref({ month: null, year: null });

const openPopup = () => {
  initial_page.month = minDate.value.getMonth();
  initial_page.year = minDate.value.getFullYear();
  const modal = new bootstrap.Modal(document.getElementById('bookingPopup'));
  modal.show();
};

const closePopup = () => {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById('bookingPopup')
  );
  modal.hide();
};

const calculateTotal = () => {
  // Tính giá tour dựa trên số lượng người
  const tourTotal = (parseFloat(tour.value.Price) || 0) * selectedPakage.value;

  // Tính tổng giá các dịch vụ đã chọn
  const servicesTotal = Object.values(selectedOptions.value).reduce(
    (total, option) => {
      const price = parseFloat(option.Price) || 0; // Giá dịch vụ
      const quantity = option.Quantity || 0; // Số lượng dịch vụ
      return total + price * quantity; // Tích lũy tổng giá trị dịch vụ
    },
    0 // Giá trị ban đầu là 0
  );

  // Tổng toàn bộ chi phí
  return tourTotal + servicesTotal;
};

const goNext = () => {
  if (validateForm()) {
    if (currentStep.value < 3) currentStep.value++;
    else createBooking();
  }
};

const goBack = () => {
  if (currentStep.value > 1) currentStep.value--;
  else closePopup();
};

const initializeParticipants = (number) => {
  Participant.splice(0, Participant.length); // Xóa tất cả phần tử hiện tại
  for (let i = 0; i < number; i++) {
    Participant.push({
      firstName: '',
      lastName: '',
      email: '',
      fullNameOnPassport: '',
      passportNumber: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      phoneNumber: '',
    });
  }
};

// current =1
//datadata
const selectedPakage = ref(1); // Lưu số lượng người tham gia
const selectedOptions = ref({}); // Lưu số lượng đã chọn cho từng option
const schedulePicked = ref({}); // Lưu lịch trình đã chọn
const itineraries = ref([]); // Lưu các lịch trình của tour

//

const _selectPackage = (value) => {
  selectedPakage.value = value; // Lưu giá trị đã chọn
  initializeParticipants(value);
};

const selectOption = (optionId, Quantity) => {
  const service = services.value.find(
    (service) => service.ServiceID == optionId
  );
  selectedOptions.value[optionId] = { Quantity, ...service }; // Cập nhật số lượng cho từng option
};

const getSchedule = (date) => {
  const index = schedules.value.findIndex((schedule) => {
    return (
      new Date(schedule.StartDate).toDateString() ===
      new Date(date).toDateString()
    );
  });
  if (index != -1) {
    schedulePicked.value = schedules.value[index];
    return schedules.value[index];
  }
};

// current = 2
const Buyer = reactive({
  firstName: '',
  lastName: '',
  email: '',
  confirmEmail: '',
  phoneNumber: '',
});

const Participant = reactive([{}]);

// current = 3
const payment = reactive({
  cardNumber: '',
  expirationDate: '',
  cvc: '',
  nameOnCard: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  country: 'Vietnam',
});
// Hàm loại bỏ 7 ngày liên tiếp sau ngày được chọn
const removeSevenDaysAfterSelectedDate = async (datePicked) => {
  selectedDate.value = new Date(datePicked).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  try {
    // Lưu vào allAvailable
    if (allAvailableDates.value != null && allAvailableDates.value.length > 0) {
      allDisabledDates.value = [
        ...allDisabledDates.value,
        ...allAvailableDates.value.slice(1),
      ];
      allAvailableDates.value = [];
    }
    const index_StartDate = schedules.value.findIndex(
      (date) =>
        new Date(date.StartDate).toDateString() === datePicked.toDateString()
    );
    // Kiểm tra ngày được chọn có ở trong schedule
    if (index_StartDate != -1) {
      const startDate = new Date(datePicked);
      allAvailableDates.value.push(datePicked);

      const dayNumber = tour.value.Duration;

      for (let i = 0; i < dayNumber; i++) {
        const dateToRemove = new Date(startDate);
        dateToRemove.setDate(startDate.getDate() + i);
        const index = allDisabledDates.value.findIndex(
          (disabledDate) =>
            disabledDate.toDateString() === dateToRemove.toDateString()
        );
        if (index !== -1) {
          allAvailableDates.value.push(allDisabledDates.value[index]);
          allDisabledDates.value.splice(index, 1);
        }
      }
    } else {
      selectedDate.value = null;
    }
  } catch (error) {
    console.error('Error remove 7 days after selected date:', error);
  }
};

const fetchTourSchedule = async (tourid) => {
  try {
    const response = await axios.get(`/api/tour/${tourid}/schedule`);
    schedules.value = response.data;

    minDate.value = new Date(
      Math.min(...schedules.value.map((item) => new Date(item.StartDate)))
    );

    maxDate.value = new Date(
      Math.max(...schedules.value.map((item) => new Date(item.StartDate)))
    );
    maxDate.value.setDate(maxDate.value.getDate() + 30);
    disabledDates();

    schedules.value.map((item) => {
      item.StartDate = new Date(item.StartDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      item.EndDate = new Date(item.EndDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });
  } catch (error) {
    console.error('Error fetching Tour Schedule:', error);
  }
};

const fetchTourDetail = async (tourid) => {
  try {
    const response = await axios.get(`/api/tour/${tourid}`);
    tour.value = response.data;
  } catch (error) {
    console.error('Error fetching Tour Detail:', error);
  }
};

const fetchTourService = async (tourid) => {
  try {
    const response = await axios.get(`/api/tour/${tourid}/service`);
    services.value = response.data;
  } catch (error) {
    console.error('Error fetching Tour Detail:', error);
  }
};

const groupedServices = () => {
  return services.value.reduce((acc, service) => {
    const status = service.Status;
    console.log(status);
    if (!acc[status]) acc[status] = [];
    acc[status].push(service);
    return acc;
  }, {});
};

const caculateMount = (mount) => {
  let arr = [];
  for (let i = 0; i <= mount; i++) {
    arr.push(i);
  }
  return arr;
};

const validateForm = () => {
  if (currentStep.value === 1) {
    if (!selectedDate.value) {
      alert('Please select a departure date.');
      return false;
    }
    if (!selectedPakage.value) {
      alert('Please select a package.');
      return false;
    }
  }

  if (currentStep.value === 2) {
    if (
      !Buyer.firstName ||
      !Buyer.lastName ||
      !Buyer.email ||
      !Buyer.confirmEmail ||
      !Buyer.phoneNumber
    ) {
      alert('Please fill in all buyer information.');
      return false;
    }
    if (Buyer.email !== Buyer.confirmEmail) {
      alert('Email and Confirm Email do not match.');
      return false;
    }
    for (let participant of Participant) {
      if (
        !participant.firstName ||
        !participant.lastName ||
        !participant.email ||
        !participant.fullNameOnPassport ||
        !participant.gender ||
        !participant.passportNumber ||
        !participant.nationality ||
        !participant.phoneNumber
      ) {
        alert('Please fill in all participant information.');
        return false;
      }
    }
  }

  return true; // Nếu không có lỗi
};

const fetchUser = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    user.value = userData;
  }
};

const fetchItyneraty = async (tourid) => {
  try {
    const response = await axios.get(`/api/itinerary/${tourid}`);
    console.log(response.data);
    itineraries.value = response.data;
  } catch (error) {
    console.error('Error fetching Tour Detail:', error);
  }
};

const createBooking = async () => {
  try {
    Participant.map((part) => {
      part.dateOfBirth = format(
        new Date(part.dateOfBirth),
        'yyyy-MM-dd HH:mm:ss'
      );
    });
    const response = await axios.post('/api/create_booking', {
      Buyer: user.value,
      Participant: Participant,
      schedulePicked: schedulePicked.value,
      selectedOptions: Object.values(selectedOptions.value),
      total: calculateTotal(),
    });

    if (response.status === 200) {
      console.log('Booking created successfully:');
      alert('Book Tour successfully');
      location.reload();
    } else {
      alert('Booking Failed');
    }
  } catch (error) {
    console.error(
      'Error creating booking:',
      error.response?.data || error.message
    );
  }
};

watch(
  () => Participant[0],
  (newVal) => {
    if (newVal) {
      Buyer.firstName = newVal.firstName;
      Buyer.lastName = newVal.lastName;
      Buyer.email = newVal.email;
      Buyer.phoneNumber = newVal.phoneNumber;
    }
  },
  { deep: true } // Theo dõi thay đổi sâu
);

watch(
  () => Buyer,
  (newVal) => {
    if (Participant[0]) {
      Participant[0].firstName = newVal.firstName;
      Participant[0].lastName = newVal.lastName;
      Participant[0].email = newVal.email;
      Participant[0].phoneNumber = newVal.phoneNumber;
    }
  },
  { deep: true }
);

// Theo dõi sự thay đổi của minDate và cập nhật initial_page khi có giá trị
watch(
  minDate,
  (newMinDate) => {
    if (newMinDate) {
      initial_page.value = {
        month: newMinDate.getMonth(),
        year: newMinDate.getFullYear(),
      };
    }
  },
  { immediate: true }
);

onMounted(() => {
  const tourid = route.params.tourid;
  fetchTourSchedule(tourid);
  fetchTourService(tourid);
  fetchTourDetail(tourid);
  fetchItyneraty(tourid);

  fetchUser();
});
</script>

<style scoped>
.herosection {
  height: 450px;
  overflow: hidden;
}
.navigatge {
  margin: auto;
}

.card-box {
  position: absolute; /* Phần tử cha cần có position khác "static" */
  height: 100%;
  right: 2%;
}

.card-booking {
  width: 250px;
  padding: 20px;
  position: sticky;
  top: 20px; /* Vị trí cố định cách đỉnh khi dính */
  background: white;
  border: 1px solid #ccc;
  z-index: 10;
}
.modal .modal-content {
  border-radius: 10px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4a4a4a; /* Màu nền tương tự */
  padding: 10px;
  color: #ffffff;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.breadcrumb-item {
  padding: 0 5px;
}

.breadcrumb-item.active {
  font-weight: bold;
}

.breadcrumb-separator {
  padding: 0 5px;
  color: #cccccc;
}

.dropdown-menu {
  max-height: 200px;
  overflow-y: auto; /* Cho phép cuộn khi danh sách dài */
}

.btn-light {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100px; /* Độ rộng của nút */
}

.page-left {
  overflow-y: auto; /* Hiển thị thanh cuộn dọc */
  overflow-x: hidden; /* Ẩn thanh cuộn ngang */
  max-height: 500px;
}

/* Tùy chỉnh thanh cuộn */
.page-left::-webkit-scrollbar {
  width: 8px; /* Chiều rộng của thanh cuộn dọc */
}

.page-left::-webkit-scrollbar-thumb {
  background-color: #888; /* Màu của thanh cuộn */
  border-radius: 4px; /* Bo góc thanh cuộn */
}

.page-left::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* Màu của thanh cuộn khi hover */
}

.page-left::-webkit-scrollbar-track {
  background: #f1f1f1; /* Màu nền của thanh cuộn */
}

.backPage {
  position: absolute;
}

.backPage:hover {
  cursor: pointer;
}

a {
  background: none;
}
</style>
