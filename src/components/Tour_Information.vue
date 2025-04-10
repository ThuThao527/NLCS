<template>
  <div class="discription">
    <div class="d-flex mx-5 justify-content-end">
      <!-- <div>
        <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i
        ><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i
        ><i class="fa-solid fa-star"></i>
        67 reviews
      </div> -->
      <div class="mx-5">
        <i class="fa-solid fa-calendar-days"></i> Duration:
        {{ Tour.Duration }}
        days
      </div>
      <div><i class="fa-regular fa-user"></i> Group size: 6 - 18</div>
    </div>
    <div class="container">
      <h2>About this trip</h2>
      {{ Tour.Description }}
    </div>
    <div class="container my-4">
      <h2>Upcoming dates</h2>

      <div v-for="(items, year) in groupedSchedules" :key="year">
        <h5 class="my-1">{{ year }}</h5>
        <div v-for="(item, index) in items" :key="index">
          <span>
            {{ item.StartDate }} -
            {{
              item.Status == 'Full' ? 'FULL ' : item.AvailableSpots + ' Spots'
            }}
          </span>
          <span v-if="item.Status == 'Full'"
            ><i class="fa-solid fa-x text-danger"></i
          ></span>
        </div>
      </div>
    </div>

    <div class="container">
      <h2><i class="fa-regular fa-face-grimace"></i> Is this tour for me ?</h2>
      <div>
        <h5>What's the average age?</h5>
        <p>
          Our trips are for ALL ages and everyone is welcome! We'd say the
          majority are 50+ but either way, we'll be a little travel family in no
          time.
        </p>
      </div>
      <div>
        <h5>Who are the trips for?</h5>
        <p>
          Come alone, bring a friend, drag your loved one, persuade your nan or
          force a reunion… everything goes! If you’ve got an open mind, a kind
          heart, a karaoke song at the ready and you love an adventure then this
          is for you.
        </p>
      </div>
      <div>
        <h5>Is volunteering hard work?</h5>
        <p>
          It's totally up to you how hard you work but zero experience is
          required! You'll be with a small team of local builders from start to
          finish. Learning a few tricks along the way and working as a team is
          all part of the fun.
        </p>
      </div>
      <div>
        <h5>What's the accommodation like?</h5>
        <p>
          We'll be staying in hand-picked awesome and unique places everywhere
          we go. From an overnight boat cruise in Ha Long Bay to an authentic
          homestay in the Mekong
        </p>
      </div>
    </div>

    <div class="container my-4">
      <h2>What included</h2>

      <div v-for="(items, status) in groupedServices" :key="status">
        <h5 class="my-1">{{ status }}</h5>
        <div v-if="status == 'Available'">
          <div v-for="(item, index) in items" :key="index">
            <div class="row mb-3">
              <div class="col-md-6">
                <span class="text-success"
                  ><i class="fa-solid fa-circle-check"></i
                ></span>
                {{ item.ServiceName }}
              </div>
              <div class="col-md-6">
                {{ item.Description }}
              </div>
            </div>
            <hr />
          </div>
        </div>
        <div v-else>
          <div v-for="(item, index) in items" :key="index">
            <div class="row mb-3">
              <div class="col-md-6">
                <span class="text-success"
                  ><i class="fa-solid fa-circle-xmark text-secondary"></i
                ></span>
                {{ item.ServiceName }}
              </div>
              <div class="col-md-6">
                {{ item.Description }}
              </div>
            </div>
            <hr />
          </div>
        </div>
      </div>
    </div>
    <h2>Itinerary</h2>
    <div class="container my-4" style="width: 80%">
      <div
        id="carouselExampleCaptions"
        class="carousel slide"
        data-bs-ride="carousel"
      >
        <div class="carousel-inner" style="border-radius: 10px">
          <div
            class="carousel-item"
            data-bs-interval="2000"
            v-for="(item, index) in Itineraries"
            :key="index"
            :class="{ active: index === 0 }"
          >
            <div class="image-container">
              <img :src="item.ImageUrl" class="d-block w-100" alt="..." />
              <!-- Lớp phủ mờ -->
              <div class="overlay"></div>
            </div>
            <div class="carousel-caption d-none d-md-block">
              <h5>Day {{ item.DayNumber }}: {{ item.Location }}</h5>
              <p><strong>Activities:</strong> {{ item.Activities }}</p>
              <p><strong>Meals Included:</strong> {{ item.MealsIncluded }}</p>
              <p>{{ item.Description }}</p>
            </div>
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  Tour: {},
  Schedules: [],
  Services: [],
  Itineraries: [],
});

const groupedSchedules = computed(() => {
  return props.Schedules.reduce((acc, schedule) => {
    const year = schedule.StartDate.split(' ').pop();
    if (!acc[year]) acc[year] = [];
    acc[year].push(schedule);
    return acc;
  }, {});
});

const groupedServices = computed(() => {
  return props.Services.reduce((acc, service) => {
    const status = service.Status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(service);
    return acc;
  }, {});
});
</script>

<style scoped>
.discription {
  max-width: 83%;
  padding: 20px 50px;
}
.fa-star {
  color: yellow;
}
p,
span,
i,
div {
  font-size: 18px;
}

.image-container {
  position: relative;
  max-height: 400px;
  margin: auto;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

/* Lớp phủ mờ */
.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  pointer-events: none;
}
</style>
