<template>
  <div class="calendar-container">
    <h1>Sắp xếp lịch làm việc của bạn</h1>
    
    <div class="calendar-grid">
      <!-- Calendar Section (Left) -->
      <div class="calendar-section">
        <!-- Calendar header with navigation -->
        <div class="calendar-header">
          <button 
            @click="previousMonth" 
            aria-label="Previous month"
          >
            <ChevronLeft class="nav-icon" />
          </button>
          
          <h2>
            {{ currentMonthName }} / {{ currentYear }}
          </h2>
          
          <button 
            @click="nextMonth" 
            aria-label="Next month"
          >
            <ChevronRight class="nav-icon" />
          </button>
        </div>
        
        <!-- Days of week header -->
        <div class="days-of-week">
          <div 
            v-for="day in daysOfWeek" 
            :key="day"
          >
            {{ day }}
          </div>
        </div>
        
        <!-- Calendar grid with drag selection -->
        <div 
          class="calendar-days"
          @mouseup="handleDragEnd"
          @mouseleave="handleDragEnd"
          @touchend="handleDragEnd"
        >
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="[
              'calendar-day',
              day.isCurrentMonth ? 'current-month' : 'other-month',
              day.isToday ? 'today' : '',
              isDateSelected(day.date) ? 'selected' : '',
            ]"
            @mousedown="handleDragStart(day.date, $event)"
            @mouseover="handleDragOver(day.date)"
            @touchstart="handleDragStart(day.date, $event)"
            @touchmove="handleTouchMove($event)"
          >
            <span :class="[
              'day-number',
              isDateSelected(day.date) ? 'selected-number' : ''
            ]">
              {{ day.dayNumber }}
            </span>
            
            <!-- Shift indicators -->
            <div v-if="getShiftsForDate(day.date).length > 0" class="shift-indicators">
              <div v-if="isFullDayShift(day.date)" class="shift-full-day">
                Full Day
              </div>
              <div v-else class="shift-list">
                <div 
                  v-for="shift in getShiftsForDate(day.date)" 
                  :key="shift"
                  :class="{
                    'shift shift1': shift === 'shift1',
                    'shift shift2': shift === 'shift2',
                    'shift shift3': shift === 'shift3'
                  }"
                >
                  {{ shift === 'shift1' ? 'S1' : shift === 'shift2' ? 'S2' : 'S3' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Selected dates summary -->
        <div v-if="selectedDates.length > 0" class="selected-dates-summary">
          <div class="summary-header">
            <div class="summary-title">Ngày đã chọn ({{ selectedDates.length }}):</div>
            <button 
              @click="clearSelection"
            >
              Bỏ chọn
            </button>
          </div>
          <div class="selected-dates-list">
            <span 
              v-for="(date, index) in sortedSelectedDates" 
              :key="index"
            >
              {{ formatDateShort(date) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Shift Selection Section (Right) -->
      <div class="shift-section">
        <h3>Ca làm</h3>
        
        <div class="shift-options">
          <!-- Regular shifts (checkboxes) -->
          <div class="shift-checkboxes">
            <label 
              :class="{ 
                'shift-label': true,
                'shift-label-selected shift1-selected': selectedShifts.includes('shift1')
              }"
            >
              <input 
                type="checkbox" 
                value="shift1" 
                v-model="selectedShifts"
                :disabled="selectedDates.length === 0 || isFullDaySelected"
                @change="handleShiftSelection"
              >
              <div>
                <div class="shift-title">Ca 1</div>
                <div class="shift-time">Buổi sáng (7am - 11am)</div>
              </div>
            </label>
            
            <label 
              :class="{ 
                'shift-label': true,
                'shift-label-selected shift2-selected': selectedShifts.includes('shift2')
              }"
            >
              <input 
                type="checkbox" 
                value="shift2" 
                v-model="selectedShifts"
                :disabled="selectedDates.length === 0 || isFullDaySelected"
                @change="handleShiftSelection"
              >
              <div>
                <div class="shift-title">Ca 2</div>
                <div class="shift-time">Buổi chiều (1pm - 5pm)</div>
              </div>
            </label>
            
            <label 
              :class="{ 
                'shift-label': true,
                'shift-label-selected shift3-selected': selectedShifts.includes('shift3')
              }"
            >
              <input 
                type="checkbox" 
                value="shift3" 
                v-model="selectedShifts"
                :disabled="selectedDates.length === 0 || isFullDaySelected"
                @change="handleShiftSelection"
              >
              <div>
                <div class="shift-title">Ca 3</div>
                <div class="shift-time">Buổi tối (6pm - 10pm)</div>
              </div>
            </label>
          </div>
          
          <!-- Full day option (radio) -->
          <div class="full-day-option">
            <label 
              :class="{ 
                'shift-label': true,
                'shift-label-selected full-day-selected': isFullDaySelected
              }"
            >
              <input 
                type="checkbox" 
                v-model="isFullDaySelected"
                :disabled="selectedDates.length === 0"
                @change="handleFullDaySelection"
              >
              <div>
                <div class="shift-title">Cả ngày</div>
                <div class="shift-time">Buổi sáng, trưa, chiều (7am - 9pm)</div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- Selection info message -->
        <div class="shift-info">
          <p v-if="isFullDaySelected">Chọn cả ngày thì sẽ không chọn cùng những ca khác được.</p>
          <p v-else>Bạn có thể chọn 2 trong 3 ca ( ca 1, 2 và 3).</p>
        </div>
        
        <button 
          @click="applyShiftsToSelectedDates" 
          class="apply-button"
          :disabled="selectedDates.length === 0 || (!isFullDaySelected && selectedShifts.length === 0)"
        >
          Áp dụng vào những ngày đã chọn
        </button>
        
        <!-- Saved shifts summary -->
        <div v-if="Object.keys(dateShifts).length > 0" class="saved-shifts">
          <h4>Ca làm đã lưu</h4>
          <div class="saved-shifts-list">
            <div 
              v-for="(shifts, dateString) in dateShifts" 
              :key="dateString"
            >
              <div>
                <div class="saved-date">{{ formatDateShort(new Date(dateString)) }}</div>
                <div class="saved-shift-tags">
                  <span 
                    v-if="shifts.includes('fullday')"
                  >
                    Full Day
                  </span>
                  <template v-else>
                    <span 
                      v-for="shift in shifts" 
                      :key="shift"
                      :class="{
                        'shift1': shift === 'shift1',
                        'shift2': shift === 'shift2',
                        'shift3': shift === 'shift3'
                      }"
                    >
                      {{ shift === 'shift1' ? 'Shift 1' : shift === 'shift2' ? 'Shift 2' : 'Shift 3' }}
                    </span>
                  </template>
                </div>
              </div>
              <button 
                @click="removeDateShift(dateString)"
              >
                <X class="remove-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Giữ nguyên phần script của bạn
import { ref, computed } from 'vue';
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import axios from 'axios';


const apiBaseUrl = 'http://localhost:3000';
const route = useRoute();
const helperId = computed(() => {
  const id = route.params.id;
  return id ? parseInt(id, 10) : 1;
});

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDates = ref([]);
const isDragging = ref(false);
const dragStartDate = ref(null);
const lastTouchedDate = ref(null);
const selectedShifts = ref([]);
const isFullDaySelected = ref(false);
const dateShifts = ref({});

// Days of week
const daysOfWeek = ['CN', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'];

// Computed properties
const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).toLocaleString('vi-VN', { month: 'long' });
});

const calendarDays = computed(() => {
  const days = [];
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - firstDayOfWeek + i + 1);
    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(date, today)
    });
  }
  
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    days.push({
      date,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: isSameDay(date, today)
    });
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push({
      date,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  return days;
});

const sortedSelectedDates = computed(() => {
  return [...selectedDates.value].sort((a, b) => a - b);
});


async function fetchAvailability() {
  console.log('HelperID before fetch:', helperId.value);
  try {
    const response = await axios.get(`${apiBaseUrl}/availability`, {
      params: { helperId: helperId.value }
    });
    dateShifts.value = response.data;
    console.log('Fetched availability:', dateShifts.value);
  } catch (error) {
    console.error('Error fetching availability:', error);
  }
}

fetchAvailability();

// Methods
function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function handleDragStart(date, event) {
  event.preventDefault();
  isDragging.value = true;
  dragStartDate.value = new Date(date);
  lastTouchedDate.value = new Date(date);
  toggleDateSelection(date);
}

function handleDragOver(date) {
  if (!isDragging.value) return;
  const currentDate = new Date(date);
  if (!isSameDay(currentDate, lastTouchedDate.value)) {
    lastTouchedDate.value = currentDate;
    selectDateRange(dragStartDate.value, currentDate);
  }
}

function handleTouchMove(event) {
  if (!isDragging.value) return;
  const touch = event.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  const dayElement = element?.closest('.calendar-day');
  if (dayElement) {
    const dayElements = Array.from(dayElement.parentElement.children);
    const index = dayElements.indexOf(dayElement);
    if (index >= 0 && index < calendarDays.value.length) {
      handleDragOver(calendarDays.value[index].date);
    }
  }
}

function handleDragEnd() {
  isDragging.value = false;
}

function selectDateRange(startDate, endDate) {
  selectedDates.value = [];
  let start = new Date(Math.min(startDate, endDate));
  let end = new Date(Math.max(startDate, endDate));
  let current = new Date(start);
  while (current <= end) {
    addDateToSelection(new Date(current));
    current.setDate(current.getDate() + 1);
  }
}

function toggleDateSelection(date) {
  const index = selectedDates.value.findIndex(d => isSameDay(d, date));
  if (index >= 0) {
    selectedDates.value.splice(index, 1);
  } else {
    addDateToSelection(date);
  }
}

function addDateToSelection(date) {
  if (!selectedDates.value.some(d => isSameDay(d, date))) {
    selectedDates.value.push(new Date(date));
  }
}

function isDateSelected(date) {
  return selectedDates.value.some(d => isSameDay(d, date));
}

function clearSelection() {
  selectedDates.value = [];
  selectedShifts.value = [];
  isFullDaySelected.value = false;
}

function handleShiftSelection() {
  if (selectedShifts.value.length > 2) {
    selectedShifts.value = selectedShifts.value.slice(0, 2);
  }
  if (selectedShifts.value.length > 0) {
    isFullDaySelected.value = false;
  }
}

function handleFullDaySelection() {
  if (isFullDaySelected.value) {
    selectedShifts.value = [];
  }
}

async function applyShiftsToSelectedDates() {
  if (selectedDates.value.length === 0) return;
  if (!isFullDaySelected.value && selectedShifts.value.length === 0) return;

  const dates = selectedDates.value.map(date => date.toISOString().split('T')[0]);
  const shifts = isFullDaySelected.value ? ['fullday'] : [...selectedShifts.value];

  try {
    const response = await axios.post(`${apiBaseUrl}/availabilityUpdate`, {
      helperId: helperId.value,
      dates,
      shifts
    });
    console.log('Saved shifts successfully:', response.data);

    // Cập nhật dateShifts sau khi lưu thành công
    dates.forEach(date => {
      dateShifts.value[date] = shifts;
    });
    selectedDates.value = [];
    selectedShifts.value = [];
    isFullDaySelected.value = false;
  } catch (error) {
    console.error('Error saving shifts:', error);
  }
}

function getShiftsForDate(date) {
  const dateString = date.toISOString().split('T')[0];
  return dateShifts.value[dateString] || [];
}

function isFullDayShift(date) {
  const shifts = getShiftsForDate(date);
  return shifts.includes('fullday');
}

async function removeDateShift(dateString) {
  try {
    const response = await axios.delete(`${apiBaseUrl}/availability/${dateString}`, {
      params: { helperId }
    });
    console.log('Deleted shift successfully:', response.data);

    // Cập nhật dateShifts sau khi xóa
    const newDateShifts = { ...dateShifts.value };
    delete newDateShifts[dateString];
    dateShifts.value = newDateShifts;
  } catch (error) {
    console.error('Error deleting shift:', error);
  }
}

function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
}

function formatDateShort(date) {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}
</script>

<style scoped>
/* Container chính */
.calendar-container {
  padding: 1.5rem;
  max-width: 64rem;
  margin: 2rem auto;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

/* Tiêu đề */
.calendar-container h1 {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Grid chính */
.calendar-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .calendar-grid {
    grid-template-columns: 2fr 1fr;
  }
}

/* Phần lịch (bên trái) */
.calendar-section {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

/* Header của lịch */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.calendar-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.calendar-header button {
  padding: 0.5rem;
  border-radius: 50%;
  background: #f3f4f6;
  transition: background 0.3s ease, transform 0.2s ease;
}

.calendar-header button:hover {
  background: #e5e7eb;
  transform: scale(1.1);
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #4b5563;
}

/* Ngày trong tuần */
.days-of-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.75rem;
}

.days-of-week div {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  padding: 0.5rem 0;
  text-transform: uppercase;
}

/* Lưới ngày */
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.calendar-day {
  position: relative;
  height: 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  user-select: none;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.calendar-day:hover {
  background: #f1f5f9;
  transform: scale(1.02);
}

.current-month {
  color: #111827;
}

.other-month {
  color: #9ca3af;
}

.today {
  background: #dbeafe;
  font-weight: 700;
  border: 2px solid #3b82f6;
}

.selected {
  background: #bfdbfe;
}

.day-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-size: 0.875rem;
  transition: background 0.3s ease, color 0.3s ease;
}

.selected-number {
  background: #3b82f6;
  color: #ffffff;
  font-weight: 600;
}

/* Chỉ báo ca làm việc */
.shift-indicators {
  position: absolute;
  bottom: 0.25rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-top: 0.25rem;
}

.shift-full-day {
  font-size: 0.75rem;
  margin: 0 auto;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  background: #d1fae5;
  color: #065f46;
}

.shift-list {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.shift {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.shift1 {
  background: #bfdbfe;
  color: #1e40af;
}

.shift2 {
  background: #e9d5ff;
  color: #6b21a8;
}

.shift3 {
  background: #fefcbf;
  color: #92400e;
}

/* Tóm tắt ngày đã chọn */
.selected-dates-summary {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-title {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.summary-header button {
  padding: 0.5rem 1rem;
  background: #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: background 0.3s ease, transform 0.2s ease;
}

.summary-header button:hover {
  background: #d1d5db;
  transform: translateY(-1px);
}

.selected-dates-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-dates-list span {
  padding: 0.5rem 1rem;
  background: #dbeafe;
  color: #1e40af;
  font-size: 0.875rem;
  border-radius: 9999px;
  font-weight: 500;
}

/* Phần chọn ca làm việc (bên phải) */
.shift-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.shift-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.shift-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shift-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.shift-label {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #ffffff;
  cursor: pointer;
  transition: background 0.3s ease, border 0.3s ease, transform 0.2s ease;
}

.shift-label:hover {
  background: #f9fafb;
  transform: translateY(-2px);
}

.shift-label input {
  margin-right: 1rem;
  accent-color: #3b82f6;
}

.shift-label-selected {
  border: 2px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shift1-selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.shift2-selected {
  border-color: #a855f7;
  background: #faf5ff;
}

.shift3-selected {
  border-color: #f59e0b;
  background: #fffbeb;
}

.full-day-selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.shift-title {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.shift-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.full-day-option {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.shift-info {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  font-style: italic;
}

.apply-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.3s ease, transform 0.2s ease;
}

.apply-button:hover {
  background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
}

.apply-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tóm tắt ca đã lưu */
.saved-shifts {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.saved-shifts h4 {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 1rem;
}

.saved-shifts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 15rem;
  overflow-y: auto;
}

.saved-shifts-list > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: transform 0.2s ease;
}

.saved-shifts-list > div:hover {
  transform: translateY(-2px);
}

.saved-date {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.saved-shift-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.saved-shift-tags span {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 9999px;
  font-weight: 500;
}

.saved-shift-tags span.shift1 {
  background: #bfdbfe;
  color: #1e40af;
}

.saved-shift-tags span.shift2 {
  background: #e9d5ff;
  color: #6b21a8;
}

.saved-shift-tags span.shift3 {
  background: #fefcbf;
  color: #92400e;
}

.saved-shift-tags span:not(.shift1, .shift2, .shift3) {
  background: #d1fae5;
  color: #065f46;
}

.saved-shifts-list button {
  padding: 0.25rem;
  border-radius: 50%;
  background: #f3f4f6;
  transition: background 0.3s ease, color 0.3s ease;
}

.saved-shifts-list button:hover {
  background: #ef4444;
  color: #ffffff;
}

.remove-icon {
  width: 1rem;
  height: 1rem;
}
</style>