<template>
  <div class="container mt-4">
    <h2 class="text-center mb-4">Statistics</h2>

    <!-- Bộ lọc -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Chosen year</label>
        <select class="form-select" v-model="selectedYear" @change="fetchData">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">Chosen quater</label>
        <select
          class="form-select"
          v-model="selectedQuarter"
          @change="fetchData"
        >
          <option value="5">Year</option>
          <option v-for="q in 4" :key="q" :value="q">Quater {{ q }}</option>
        </select>
      </div>
    </div>

    <!-- Thống kê -->
    <div class="row text-center">
      <div class="col-md-3" v-for="(item, key) in stats" :key="key">
        <div class="card p-3 shadow">
          <h5>{{ item.label }}</h5>
          <p class="fw-bold fs-4">{{ item.value || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Biểu đồ -->
    <div class="row mt-4">
      <div class="col-md-6">
        <h5 class="text-center">Tour Occupancy Rate</h5>
        <DoughnutChart :chart-data="chartData" />
      </div>
      <div class="col-md-6">
        <h5 class="text-center">Profit & Number of Customers per Tour</h5>
        <LineChart :chart-data="lineChartData" :chart-options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';
import { DoughnutChart, LineChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

const selectedYear = ref(new Date().getFullYear());
const selectedQuarter = ref(5);
const availableYears = ref([]);
const currentYear = new Date().getFullYear(); // Lấy năm hiện tại

// Tạo danh sách từ 5 năm trước đến 5 năm sau
for (let i = currentYear - 5; i <= currentYear; i++) {
  availableYears.value.push(i);
}

const stats = ref({
  totalBookings: { label: 'Total Tour Bookings', value: 0 },
  totalRevenue: { label: 'Revenue', value: '0' },
  totalGuests: { label: 'Total Participants', value: 0 },
  avgAge: { label: 'Average Age', value: '0' },
});

const chartData = ref({
  labels: ['Occupied', 'Vacant'],
  datasets: [
    {
      backgroundColor: ['#36A2EB', '#FF6384'],
      data: [0, 0],
    },
  ],
});

const lineChartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Revenue ($)',
      borderColor: '#FF6384',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      data: [],
      yAxisID: 'y1',
    },
    {
      label: 'Number of Customers',
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      data: [],
      yAxisID: 'y',
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      type: 'linear',
      position: 'left',
      title: { display: true, text: 'Number of Customers' },
      min: 0,
      max: 800, // Đặt max gần với dữ liệu số khách để dễ nhìn hơn
      ticks: {
        stepSize: 100, // Chia nhỏ khoảng cách giữa các giá trị
      },
    },
    y1: {
      type: 'linear',
      position: 'right',
      title: { display: true, text: 'Revenue ($)' },
      min: 0,
      max: 12, // Giữ max của doanh thu gần với dữ liệu hiện tại
      ticks: {
        stepSize: 2, // Chia nhỏ khoảng cách để nhìn rõ hơn
      },
      grid: { drawOnChartArea: false }, // Tránh trùng lưới với trục Y bên trái
    },
  },
});

const fetchData = async () => {
  try {
    const { data } = await axios.get('/api/statistics', {
      params: { year: selectedYear.value, quarter: selectedQuarter.value },
    });

    console.log('data statistics: ', data);

    stats.value.totalBookings.value = data.stats.totalBookings;
    stats.value.totalRevenue.value = parseFloat(
      data.stats.totalRevenue
    ).toFixed(2);
    stats.value.avgAge.value = parseFloat(data.avgAge).toFixed(2);

    stats.value.totalGuests.value = data.stats.totalGuests;

    // Cập nhật dữ liệu biểu đồ đường
    try {
      const { data } = await axios.get('/api/tour-statistics', {
        params: { year: selectedYear.value, quarter: selectedQuarter.value },
      });

      console.log(data.datasets);
      lineChartData.value.labels = Array.from(
        { length: data.datasets[0].data.length },
        (_, i) => String.fromCharCode(65 + i)
      );
      lineChartData.value.datasets[0].data = data.datasets[0].data; // Doanh thu
      lineChartData.value.datasets[1].data = data.datasets[1].data; // Số lượng khách
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }

    // Gọi API để lấy tỷ lệ lấp đầy tour
    const capacityResponse = await axios.get('/api/tour-capacity', {
      params: { year: selectedYear.value, quarter: selectedQuarter.value },
    });
    const total =
      capacityResponse.data.notFilled + capacityResponse.data.filled;
    console.log('capacityResponse: ', capacityResponse.data);
    chartData.value.datasets[0].data = [
      parseFloat((capacityResponse.data.filled * 100) / total).toFixed(2),
      parseFloat((capacityResponse.data.notFilled * 100) / total).toFixed(2),
    ];
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
  }
};

onMounted(fetchData);
</script>

<style scoped>
.card {
  border-radius: 10px;
}
</style>
