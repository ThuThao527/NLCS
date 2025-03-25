<template>
  <div class="fee-container">
    <h1>Thiết Lập Phí Dịch Vụ</h1>
    <p class="description">
      Cấu hình mức phí bạn tính cho các dịch vụ của mình. Bạn có thể đặt các mức giá khác nhau dựa trên khoảng thời gian.
    </p>

    <!-- Tùy chọn giá -->
    <div class="pricing-options">
      <!-- Giá theo giờ -->
      <div class="pricing-card">
        <div class="pricing-header">
          <h2>Giá Theo Giờ</h2>
          <Switch 
            v-model="pricingOptions.hourly.enabled"
          />
        </div>
        
        <div v-if="pricingOptions.hourly.enabled" class="pricing-content">
          <div class="input-group">
            <span class="currency">VNĐ</span>
            <input 
              v-model="pricingOptions.hourly.rate" 
              type="number" 
              min="0" 
              step="0.01"
              placeholder="0.00"
            />
            <span class="unit">mỗi giờ</span>
          </div>
          <p class="note">
            Đây là mức giá tiêu chuẩn theo giờ cho tất cả các dịch vụ.
          </p>
        </div>
      </div>

      <!-- Giá theo ca -->
      <div class="pricing-card">
        <div class="pricing-header">
          <h2>Giá Theo Ca</h2>
          <Switch 
            v-model="pricingOptions.shift.enabled"
          />
        </div>
        
        <div v-if="pricingOptions.shift.enabled" class="pricing-content shift-rates">
          <div>
            <label class="rate-label">Ca Sáng (4 giờ)</label>
            <div class="input-group">
              <span class="currency">VNĐ</span>
              <input 
                v-model="pricingOptions.shift.morningRate" 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="0.00"
              />
              <span class="unit">mỗi ca</span>
            </div>
          </div>
          
          <div>
            <label class="rate-label">Ca Chiều (4 giờ)</label>
            <div class="input-group">
              <span class="currency">VNĐ</span>
              <input 
                v-model="pricingOptions.shift.afternoonRate" 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="0.00"
              />
              <span class="unit">mỗi ca</span>
            </div>
          </div>
          
          <div>
            <label class="rate-label">Ca Tối (4 giờ)</label>
            <div class="input-group">
              <span class="currency">VNĐ</span>
              <input 
                v-model="pricingOptions.shift.eveningRate" 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="0.00"
              />
              <span class="unit">mỗi ca</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Giá theo ngày -->
      <div class="pricing-card">
        <div class="pricing-header">
          <h2>Giá Theo Ngày</h2>
          <Switch 
            v-model="pricingOptions.daily.enabled"
          />
        </div>
        
        <div v-if="pricingOptions.daily.enabled" class="pricing-content">
          <div class="input-group">
            <span class="currency">VNĐ</span>
            <input 
              v-model="pricingOptions.daily.rate" 
              type="number" 
              min="0" 
              step="0.01"
              placeholder="0.00"
            />
            <span class="unit">mỗi ngày (8 giờ)</span>
          </div>
          <p class="note">
            Đây là mức giá tiêu chuẩn cho một ngày làm việc đầy đủ.
          </p>
        </div>
      </div>

      <!-- Giá nhiều ngày -->
      <div class="pricing-card">
        <div class="pricing-header">
          <h2>Giá Nhiều Ngày</h2>
          <Switch 
            v-model="pricingOptions.multiDay.enabled"
          />
        </div>
        
        <div v-if="pricingOptions.multiDay.enabled" class="pricing-content">
          <p class="note">
            Đặt các mức giá khác nhau cho các khoảng thời gian dài. Điều này cho phép bạn cung cấp chiết khấu cho các đặt chỗ dài hơn.
          </p>
          
          <div class="tier-list">
            <div v-for="(tier, index) in pricingOptions.multiDay.tiers" :key="index" class="tier-item">
              <div class="tier-header">
                <h3>{{ getTierLabel(tier) }}</h3>
                <button 
                  v-if="index > 0" 
                  @click="removeTier(index)"
                >
                  <Trash2 class="remove-icon" />
                </button>
              </div>
              
              <div class="tier-details">
                <div>
                  <label class="rate-label">Số ngày (tối thiểu - tối đa)</label>
                  <div class="input-group">
                    <input 
                      v-model="tier.minDays" 
                      type="number" 
                      min="1"
                      :disabled="index === 0"
                      @change="validateTiers"
                    />
                    <span>-</span>
                    <input 
                      v-model="tier.maxDays" 
                      type="number" 
                      min="1"
                      @change="validateTiers"
                    />
                    <span class="unit">ngày</span>
                  </div>
                </div>
                
                <div>
                  <label class="rate-label">Giá mỗi ngày</label>
                  <div class="input-group">
                    <span class="currency">VNĐ</span>
                    <input 
                      v-model="tier.rate" 
                      type="number" 
                      min="0" 
                      step="0.01"
                      placeholder="0.00"
                    />
                    <span class="unit">mỗi ngày</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              @click="addTier"
              class="add-tier-button"
            >
              <PlusCircle class="add-icon" />
              Thêm mức giá mới
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Nút lưu -->
    <div class="save-section">
      <button @click="saveSettings">
        Lưu Cài Đặt Phí
      </button>
    </div>

    <!-- Phần xem trước -->
    <div class="preview-section">
      <h2>Xem Trước Phí</h2>
      <div class="preview-card">
        <div class="preview-content">
          <div v-if="pricingOptions.hourly.enabled" class="preview-item">
            <span>Giá Theo Giờ:</span>
            <span class="value">{{ formatCurrency(pricingOptions.hourly.rate) }} VNĐ</span>
          </div>
          
          <div v-if="pricingOptions.shift.enabled" class="preview-item">
            <div class="preview-label">Giá Theo Ca:</div>
            <div class="shift-details">
              <div class="shift-item">
                <span>Ca Sáng:</span>
                <span>{{ formatCurrency(pricingOptions.shift.morningRate) }} VNĐ</span>
              </div>
              <div class="shift-item">
                <span>Ca Chiều:</span>
                <span>{{ formatCurrency(pricingOptions.shift.afternoonRate) }} VNĐ</span>
              </div>
              <div class="shift-item">
                <span>Ca Tối:</span>
                <span>{{ formatCurrency(pricingOptions.shift.eveningRate) }} VNĐ</span>
              </div>
            </div>
          </div>
          
          <div v-if="pricingOptions.daily.enabled" class="preview-item">
            <span>Giá Theo Ngày:</span>
            <span class="value">{{ formatCurrency(pricingOptions.daily.rate) }} VNĐ</span>
          </div>
          
          <div v-if="pricingOptions.multiDay.enabled" class="preview-item">
            <div class="preview-label">Giá Nhiều Ngày:</div>
            <div class="multi-day-details">
              <div v-for="(tier, index) in pricingOptions.multiDay.tiers" :key="index" class="multi-day-item">
                <span>{{ getTierLabel(tier) }}:</span>
                <span>{{ formatCurrency(tier.rate) }} VNĐ mỗi ngày</span>
              </div>
            </div>
          </div>
          
          <div v-if="!hasEnabledOptions" class="no-options">
            Chưa có tùy chọn giá nào được kích hoạt. Vui lòng kích hoạt ít nhất một tùy chọn ở trên.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PlusCircle, Trash2 } from 'lucide-vue-next';
import { h, defineComponent } from 'vue';

// Custom Switch component
const Switch = defineComponent({
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const toggle = () => {
      emit('update:modelValue', !props.modelValue);
    };
    
    return () => h('button', {
      class: [
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.modelValue ? 'bg-blue-600' : 'bg-gray-200'
      ],
      onClick: toggle,
      type: 'button',
      role: 'switch',
      'aria-checked': props.modelValue
    }, [
      h('span', {
        class: [
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          props.modelValue ? 'translate-x-6' : 'translate-x-1'
        ]
      })
    ]);
  }
});

// State for pricing options
const pricingOptions = ref({
  hourly: {
    enabled: true,
    rate: 250000 // Đổi đơn vị sang VNĐ
  },
  shift: {
    enabled: true,
    morningRate: 800000,
    afternoonRate: 800000,
    eveningRate: 1000000
  },
  daily: {
    enabled: true,
    rate: 1800000
  },
  multiDay: {
    enabled: true,
    tiers: [
      { minDays: 1, maxDays: 1, rate: 1800000 },
      { minDays: 2, maxDays: 3, rate: 1600000 },
      { minDays: 4, maxDays: 7, rate: 1500000 },
      { minDays: 8, maxDays: null, rate: 1400000 }
    ]
  }
});

// Computed property to check if any pricing option is enabled
const hasEnabledOptions = computed(() => {
  return pricingOptions.value.hourly.enabled || 
         pricingOptions.value.shift.enabled || 
         pricingOptions.value.daily.enabled || 
         pricingOptions.value.multiDay.enabled;
});

// Format currency values
function formatCurrency(value) {
  return parseFloat(value || 0).toLocaleString('vi-VN'); // Định dạng số theo kiểu VNĐ
}

// Get label for multi-day tier
function getTierLabel(tier) {
  if (tier.minDays === 1 && tier.maxDays === 1) {
    return "1 ngày";
  } else if (tier.minDays === tier.maxDays) {
    return `${tier.minDays} ngày`;
  } else if (tier.maxDays === null) {
    return `${tier.minDays} ngày trở lên`;
  } else {
    return `${tier.minDays}-${tier.maxDays} ngày`;
  }
}

// Add a new tier to multi-day pricing
function addTier() {
  const tiers = pricingOptions.value.multiDay.tiers;
  const lastTier = tiers[tiers.length - 1];
  
  const newMinDays = lastTier.maxDays ? lastTier.maxDays + 1 : lastTier.minDays + 1;
  
  tiers.push({
    minDays: newMinDays,
    maxDays: newMinDays + 2,
    rate: lastTier.rate * 0.9 // 10% discount from previous tier as default
  });
  
  validateTiers();
}

// Remove a tier from multi-day pricing
function removeTier(index) {
  pricingOptions.value.multiDay.tiers.splice(index, 1);
  validateTiers();
}

// Validate tiers to ensure they don't overlap and are in sequence
function validateTiers() {
  const tiers = pricingOptions.value.multiDay.tiers;
  
  tiers.sort((a, b) => a.minDays - b.minDays);
  
  if (tiers.length > 0) {
    tiers[0].minDays = 1;
  }
  
  for (let i = 1; i < tiers.length; i++) {
    const prevTier = tiers[i-1];
    const currentTier = tiers[i];
    
    if (prevTier.maxDays === null) {
      prevTier.maxDays = currentTier.minDays - 1;
    }
    
    if (currentTier.minDays <= prevTier.maxDays) {
      currentTier.minDays = prevTier.maxDays + 1;
    }
    
    if (currentTier.maxDays !== null && currentTier.maxDays < currentTier.minDays) {
      currentTier.maxDays = currentTier.minDays;
    }
  }
  
  if (tiers.length > 0) {
    const lastTier = tiers[tiers.length - 1];
    if (lastTier.maxDays === null || lastTier.maxDays >= 30) {
      lastTier.maxDays = null;
    }
  }
}

// Save settings
function saveSettings() {
  console.log('Lưu cài đặt phí:', pricingOptions.value);
  alert('Cài đặt phí của bạn đã được lưu thành công!');
}
</script>

<style scoped>
/* Container chính */
.fee-container {
  padding: 2rem;
  max-width: 64rem;
  margin: 2rem auto;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

/* Tiêu đề */
.fee-container h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Mô tả */
.description {
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 2rem;
}

/* Tùy chọn giá */
.pricing-options {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Card giá */
.pricing-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

/* Header của card giá */
.pricing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.pricing-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

/* Nội dung giá */
.pricing-content {
  margin-top: 1rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency,
.unit {
  font-size: 1rem;
  color: #6b7280;
}

.input-group input {
  width: 8rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #111827;
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.note {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

/* Giá theo ca */
.shift-rates {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rate-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

/* Giá nhiều ngày */
.tier-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tier-item {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.tier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.tier-header h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.tier-header button {
  padding: 0.25rem;
  border-radius: 50%;
  background: #f3f4f6;
  transition: background 0.3s ease, color 0.3s ease;
}

.tier-header button:hover {
  background: #ef4444;
  color: #ffffff;
}

.remove-icon {
  width: 1rem;
  height: 1rem;
}

.tier-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .tier-details {
    grid-template-columns: 1fr 1fr;
  }
}

.tier-details input {
  width: 5rem;
}

/* Nút thêm mức giá */
.add-tier-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #3b82f6;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.add-tier-button:hover {
  color: #2563eb;
}

.add-icon {
  width: 1rem;
  height: 1rem;
}

/* Nút lưu */
.save-section {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.save-section button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.3s ease, transform 0.2s ease;
}

.save-section button:hover {
  background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
}

/* Phần xem trước */
.preview-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.preview-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.preview-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-item {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.preview-item:first-child {
  border-top: none;
  padding-top: 0;
}

.preview-item > span,
.preview-label {
  font-size: 1rem;
  color: #4b5563;
}

.preview-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.value {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
}

.shift-details,
.multi-day-details {
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.shift-item,
.multi-day-item {
  display: flex;
  justify-content: space-between;
}

.no-options {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}
</style>