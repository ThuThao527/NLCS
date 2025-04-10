<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Left Section (Information) -->
      <div class="col-md-6 bg-dark text-white p-5">
        <div class="row">
          <img
            src="https://i.pinimg.com/736x/78/05/c6/7805c6c344db3a56abd1468be04f3044.jpg"
            alt=""
            class="col-6"
          />
          <div class="col-6">
            <h3>Da Nang Is Your Home</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus
              aliquid, doloribus fugit eaque doloremque iure minima officiis
              animi asperiores alias nesciunt explicabo, quae, minus suscipit
              exercitationem tempore ipsa cum natus. Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Perspiciatis, nisi. Veniam suscipit
              vitae nihil. Modi adipisci reiciendis corrupti, libero cumque
              reprehenderit similique, sapiente quas debitis vitae consequatur
              dignissimos, tempora velit?
            </p>
          </div>
        </div>

        <div class="info">
          <a href="#" class="text-white me-2"
            ><i class="fab fa-facebook-f"></i
          ></a>
          <a href="#" class="text-white me-2"><i class="fab fa-twitter"></i></a>
          <a href="#" class="text-white me-2"
            ><i class="fab fa-instagram"></i
          ></a>
        </div>
      </div>

      <!-- Right Section (Contact Form) -->
      <div
        class="col-md-6 text-white p-5 d-flex flex-column justify-content-center right-section"
      >
        <h4>Enter your information to get ebook</h4>

        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="name" class="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              class="form-control"
              v-model="form.name"
              required
            />
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              class="form-control"
              v-model="form.email"
              required
            />
          </div>
          <button type="submit" class="btn btn-light">Submit</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
      },
    };
  },
  methods: {
    submitForm() {
      // Xử lý dữ liệu form ở đây
      console.log('Form submitted', this.form);
    },
  },
};
</script>

<style scoped>
.container-fluid {
  margin: 30px 0;
}

.bg-dark {
  border-radius: 10px 0 0 10px;
}

.info {
  margin-top: 30px;
}

.right-section {
  background-color: rgba(31, 68, 95, 0.95);
  border-radius: 0 10px 10px 0;
}

.btn {
  background-color: rgb(79, 146, 191);
  color: #fff;
  font-weight: bold;
  border: none;
}

.btn:active {
  transform: scale(0.95); /* Thu nhỏ phần tử khi click */
  transition: transform 0.2s ease-in-out;
  background-color: rgb(79, 146, 191);
  color: #fff;
}

h4 {
  text-transform: capitalize;
}
</style>
