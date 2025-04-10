<template>
  <div class="calendar-container p-4 max-w-4xl mx-auto bg-white rounded-lg shadow">
    <h1 class="text-2xl font-bold text-center mb-6">Schedule your availability</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Calendar Section (Left) -->
      <div class="md:col-span-2">
        <!-- Calendar header with navigation -->
        <div class="flex justify-between items-center mb-4">
          <button 
            @click="previousMonth" 
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          
          <h2 class="text-xl font-semibold">
            {{ currentMonthName }} {{ currentYear }}
          </h2>
          
          <button 
            @click="nextMonth" 
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>
        
        <!-- Days of week header -->
        <div class="grid grid-cols-7 mb-2">
          <div 
            v-for="day in daysOfWeek" 
            :key="day" 
            class="text-center font-medium text-sm py-2"
          >
            {{ day }}
          </div>
        </div>
        
        <!-- Calendar grid with drag selection -->
        <div 
          class="grid grid-cols-7 gap-1"
          @mouseup="handleDragEnd"
          @mouseleave="handleDragEnd"
          @touchend="handleDragEnd"
        >
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="[
              'relative h-14 flex flex-col items-center justify-center rounded select-none',
              day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
              day.isToday ? 'bg-blue-50 font-bold' : '',
              isDateSelected(day.date) ? 'bg-blue-100' : '',
              'cursor-pointer transition-colors'
            ]"
            @mousedown="handleDragStart(day.date, $event)"
            @mouseover="handleDragOver(day.date)"
            @touchstart="handleDragStart(day.date, $event)"
            @touchmove="handleTouchMove($event)"
          >
            <span :class="[
              'flex items-center justify-center w-8 h-8 rounded-full',
              isDateSelected(day.date) ? 'bg-blue-500 text-white' : ''
            ]">
              {{ day.dayNumber }}
            </span>
            
            <!-- Shift indicators -->
            <div v-if="getShiftsForDate(day.date).length > 0" class="absolute bottom-0 w-full flex flex-col gap-0.5 mt-1">
              <div v-if="isFullDayShift(day.date)" 
                class="text-xs mx-auto text-center px-1 py-0.5 rounded-sm font-medium bg-green-200 text-green-800">
                Full Day
              </div>
              <div v-else class="flex justify-center gap-1">
                <div 
                  v-for="shift in getShiftsForDate(day.date)" 
                  :key="shift"
                  class="text-xs px-1 py-0.5 rounded-sm font-medium"
                  :class="{
                    'bg-blue-200 text-blue-800': shift === 'shift1',
                    'bg-purple-200 text-purple-800': shift === 'shift2',
                    'bg-amber-200 text-amber-800': shift === 'shift3'
                  }"
                >
                  {{ shift === 'shift1' ? 'S1' : shift === 'shift2' ? 'S2' : 'S3' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Selected dates summary -->
        <div v-if="selectedDates.length > 0" class="mt-4 pt-4 border-t">
          <div class="flex justify-between items-center mb-2">
            <div class="font-medium">Selected Dates ({{ selectedDates.length }}):</div>
            <button 
              @click="clearSelection" 
              class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
            >
              Clear Selection
            </button>
          </div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="(date, index) in sortedSelectedDates" 
              :key="index"
              class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {{ formatDateShort(date) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Shift Selection Section (Right) -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Working Shifts</h3>
        
        <div class="space-y-3">
          <!-- Regular shifts (checkboxes) -->
          <div class="space-y-2 mb-4">
            <label 
              class="flex items-center p-3 border rounded cursor-pointer transition-colors"
              :class="{ 
                'bg-white border-gray-300 hover:bg-gray-50': !selectedShifts.includes('shift1'),
                'bg-blue-50 border-blue-300': selectedShifts.includes('shift1')
              }"
            >
              <input 
                type="checkbox" 
                value="shift1" 
                v-model="selectedShifts"
                class="mr-3"
                :disabled="selectedDates.length === 0 || isFullDaySelected"
                @change="handleShiftSelection"
              >
              <div>
                <div class="font-medium">Shift 1</div>
                <div class="text-sm text-gray-500">Morning shift (8am - 11am)</div>
              </div>
            </label>
            
            <label 
              class="flex items-center p-3 border rounded cursor-pointer transition-colors"
              :class="{ 
                'bg-white border-gray-300 hover:bg-gray-50': !selectedShifts.includes('shift2'),
                'bg-purple-50 border-purple-300': selectedShifts.includes('shift2')
              }"
            >
              <input 
                type="checkbox" 
                value="shift2" 
                v-model="selectedShifts"
                class="mr-3"
                :disabled="selectedDates.length === 0 || isFullDaySelected"
                @change="handleShiftSelection"
              >
              <div>
                <div class="font-medium">Shift 2</div>
                <div class="text-sm text-gray-500">Afternoon shift (12pm - 3pm)</div>
              </div>
            </label>
            
            <label 
              class="flex items-center p-3 border rounded cursor-pointer transition-colors"
              :class="{ 
                'bg-white border-gray-300 hover:bg-gray-50': !selectedShifts.includes('shift3'),
                'bg-amber-50 border-amber-300': selectedShifts.includes('shift3')
              }"
            >
              <input 
                type="checkbox" 
                value="shift3" 
                v-model="selectedShifts"
                class="mr-3"
                :disabled="selectedDates.length === 0 || isFullDaySelected"
                @change="handleShiftSelection"
              >
              <div>
                <div class="font-medium">Shift 3</div>
                <div class="text-sm text-gray-500">Evening shift (4pm - 7pm)</div>
              </div>
            </label>
          </div>
          
          <!-- Full day option (radio) -->
          <div class="pt-2 border-t">
            <label 
              class="flex items-center p-3 border rounded cursor-pointer transition-colors"
              :class="{ 
                'bg-white border-gray-300 hover:bg-gray-50': !isFullDaySelected,
                'bg-green-50 border-green-300': isFullDaySelected
              }"
            >
              <input 
                type="checkbox" 
                v-model="isFullDaySelected"
                class="mr-3"
                :disabled="selectedDates.length === 0"
                @change="handleFullDaySelection"
              >
              <div>
                <div class="font-medium">Full Day</div>
                <div class="text-sm text-gray-500">Complete day (8am - 7pm)</div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- Selection info message -->
        <div class="mt-4 text-sm text-gray-600 italic">
          <p v-if="isFullDaySelected">Full Day cannot be combined with other shifts.</p>
          <p v-else>You can select up to 2 shifts (Shift 1, 2, or 3).</p>
        </div>
        
        <button 
          @click="applyShiftsToSelectedDates" 
          class="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="selectedDates.length === 0 || (!isFullDaySelected && selectedShifts.length === 0)"
        >
          Apply to Selected Dates
        </button>
        
        <!-- Saved shifts summary -->
        <div v-if="Object.keys(dateShifts).length > 0" class="mt-6 pt-4 border-t">
          <h4 class="font-medium mb-2">Saved Shifts:</h4>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div 
              v-for="(shifts, dateString) in dateShifts" 
              :key="dateString"
              class="flex justify-between items-center p-2 bg-white rounded border"
            >
              <div>
                <div class="font-medium">{{ formatDateShort(new Date(dateString)) }}</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span 
                    v-if="shifts.includes('full')"
                    class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"
                  >
                    Full Day
                  </span>
                  <template v-else>
                    <span 
                      v-for="shift in shifts" 
                      :key="shift"
                      class="text-xs px-2 py-0.5 rounded-full"
                      :class="{
                        'bg-blue-100 text-blue-800': shift === 'shift1',
                        'bg-purple-100 text-purple-800': shift === 'shift2',
                        'bg-amber-100 text-amber-800': shift === 'shift3'
                      }"
                    >
                      {{ shift === 'shift1' ? 'Shift 1' : shift === 'shift2' ? 'Shift 2' : 'Shift 3' }}
                    </span>
                  </template>
                </div>
              </div>
              <button 
                @click="removeDateShift(dateString)" 
                class="text-gray-500 hover:text-red-500"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next';

// State
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDates = ref([]);
const isDragging = ref(false);
const dragStartDate = ref(null);
const lastTouchedDate = ref(null);
const selectedShifts = ref([]);
const isFullDaySelected = ref(false);
const dateShifts = ref({});  // Object to store date -> shifts array mappings

// Days of week
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Computed properties
const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).toLocaleString('default', { month: 'long' });
});

const calendarDays = computed(() => {
  const days = [];
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  // Get the day of the week for the first day (0-6, where 0 is Sunday)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Add days from previous month
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
  
  // Add days of current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    days.push({
      date,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: isSameDay(date, today)
    });
  }
  
  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 rows of 7 days
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
  // Prevent default to avoid text selection during drag
  event.preventDefault();
  
  isDragging.value = true;
  dragStartDate.value = new Date(date);
  lastTouchedDate.value = new Date(date);
  
  // Toggle selection of the first date
  toggleDateSelection(date);
}

function handleDragOver(date) {
  if (!isDragging.value) return;
  
  const currentDate = new Date(date);
  
  // If we're dragging over a new date
  if (!isSameDay(currentDate, lastTouchedDate.value)) {
    lastTouchedDate.value = currentDate;
    
    // Select all dates between drag start and current
    selectDateRange(dragStartDate.value, currentDate);
  }
}

function handleTouchMove(event) {
  if (!isDragging.value) return;
  
  // Get the element under the touch point
  const touch = event.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  
  // Find the calendar day element
  const dayElement = element?.closest('.grid-cols-7 > div');
  if (dayElement) {
    // Get the index of the day element
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
  // Clear previous selection
  selectedDates.value = [];
  
  // Ensure startDate is before endDate
  let start = new Date(Math.min(startDate, endDate));
  let end = new Date(Math.max(startDate, endDate));
  
  // Add all dates in the range
  let current = new Date(start);
  while (current <= end) {
    addDateToSelection(new Date(current));
    current.setDate(current.getDate() + 1);
  }
}

function toggleDateSelection(date) {
  const index = selectedDates.value.findIndex(d => isSameDay(d, date));
  
  if (index >= 0) {
    // Date is already selected, remove it
    selectedDates.value.splice(index, 1);
  } else {
    // Date is not selected, add it
    addDateToSelection(date);
  }
}

function addDateToSelection(date) {
  // Only add if not already in the selection
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
  // Limit to 2 shifts maximum
  if (selectedShifts.value.length > 2) {
    selectedShifts.value = selectedShifts.value.slice(0, 2);
  }
  
  // If any shift is selected, ensure full day is deselected
  if (selectedShifts.value.length > 0) {
    isFullDaySelected.value = false;
  }
}

function handleFullDaySelection() {
  // If full day is selected, clear other shifts
  if (isFullDaySelected.value) {
    selectedShifts.value = [];
  }
}

function applyShiftsToSelectedDates() {
  if (selectedDates.value.length === 0) return;
  if (!isFullDaySelected.value && selectedShifts.value.length === 0) return;
  
  // Apply the selected shifts to all selected dates
  selectedDates.value.forEach(date => {
    const dateString = date.toISOString().split('T')[0];
    if (isFullDaySelected.value) {
      dateShifts.value[dateString] = ['full'];
    } else {
      dateShifts.value[dateString] = [...selectedShifts.value];
    }
  });
  
  // Clear the selection after applying
  selectedDates.value = [];
  selectedShifts.value = [];
  isFullDaySelected.value = false;
}

function getShiftsForDate(date) {
  const dateString = date.toISOString().split('T')[0];
  return dateShifts.value[dateString] || [];
}

function isFullDayShift(date) {
  const shifts = getShiftsForDate(date);
  return shifts.includes('full');
}

function removeDateShift(dateString) {
  const newDateShifts = { ...dateShifts.value };
  delete newDateShifts[dateString];
  dateShifts.value = newDateShifts;
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