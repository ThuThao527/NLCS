<template>
  <div class="rating-component p-3">
    <h4>Đánh giá sản phẩm</h4>
    <div class="rating-summary d-flex align-items-center">
      <div class="average-rating me-3">
        <h1 class="mb-0">{{ averageRating.toFixed(2) }}</h1>
        <p>{{ totalReviews }} đánh giá</p>
      </div>
      <div class="progress-bars flex-grow-1">
        <div
          v-for="(count, index) in starRatings"
          :key="index"
          class="d-flex align-items-center"
        >
          <span class="me-2">{{ 5 - index }} ★</span>
          <div class="progress flex-grow-1">
            <div
              class="progress-bar bg-warning"
              role="progressbar"
              :style="{ width: (count / totalReviews) * 100 + '%' }"
              :aria-valuenow="count"
              aria-valuemin="0"
              :aria-valuemax="totalReviews"
            ></div>
          </div>
          <span class="ms-2">{{ count }}</span>
        </div>
      </div>
    </div>
    <hr />
    <h5>Đánh giá của khách hàng</h5>
    <div
      v-for="review in reviews"
      :key="review.id"
      class="customer-review mb-3"
    >
      <h6>{{ review.name }}</h6>
      <p>{{ review.comment }}</p>
      <span class="text-warning">
        <i v-for="n in review.rating" :key="n" class="bi bi-star-fill"></i>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      averageRating: 4.74,
      totalReviews: 29,
      starRatings: [0, 1, 7, 17, 4],
      reviews: [
        {
          id: 1,
          name: 'Nguyễn Văn Nam',
          comment: 'Giao diện đẹp, dễ sử dụng',
          rating: 5,
        },
        { id: 2, name: 'Quốc Hân', comment: 'Tốt, ổn định', rating: 4 },
      ],
    };
  },
};
</script>

<style scoped>
.rating-summary {
  display: flex;
  gap: 1rem;
}
.progress-bars .progress {
  height: 8px;
  margin-left: 0.5rem;
}
.customer-review h6 {
  font-weight: bold;
}
</style>
