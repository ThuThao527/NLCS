<template>
  <footer>
    <div
      class="content d-flex flex-column justify-content-center align-items-center text-center"
    >
      <img src="../assets/logo.png" alt="Logo" class="logo" />
      <div class="line"></div>
      <h1 style="font-size: 30px">Tham gia vào cộng đồng của chúng tôi!</h1>
      <div style="width: 200px">
        Để biết thêm nhiều thông tin và lợi ích từ dịch vụ.
      </div>
    </div>
    <div
      class="social d-flex flex-column justify-content-center align-items-center"
    >
      <div class="container">
        <div class="row justify-content-center flex-column flex-xl-row m-2">
          <a class="sol facebook col-12 col-xl-2 text-center"
            ><i class="fa-brands fa-facebook"></i
          ></a>
          <a class="sol tiktok col-12 col-xl-2 text-center"
            ><i class="fa-brands fa-tiktok"></i
          ></a>
          <a class="sol ins col-12 col-xl-2 text-center"
            ><i class="fa-brands fa-square-instagram"></i
          ></a>
          <a class="sol youtobe col-12 col-xl-2 text-center"
            ><i class="fa-brands fa-youtube"></i
          ></a>
          <a class="sol telegram col-12 col-xl-2 text-center"
            ><i class="fa-brands fa-telegram"></i
          ></a>
        </div>
      </div>
      <div class="line"></div>
      <div class="mb-3">@2024 by Hurminity Charity Travel</div>
    </div>
  </footer>
</template>
<style scoped>
footer {
  background-image: url('https://www.realsimple.com/thmb/VRH1_Fk5MRzpHSG1gutVvIAJjiM=/1500x0/filters:no_upscale():max_bytes(200000):strip_icc()/how-to-clean-everything-tout-44daa25fd71448ddba7757b6f4fe14d4.pnghttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-VodueRjbuYW0fYzktOENmE1FQyTHNncLSA&s');
  /* background-position:center; */
  background-size: cover;
  background-repeat: no-repeat;
  padding-bottom: 10px;
  /* background-color: #1f; */
  position: relative;
  background-color: black;
}
.content {
  /* background-color: bisque; */
  padding: 30px 60px 0 60px;
  /* color: #1f445f; */
  color: #fff;
}

.content .line {
  background: linear-gradient(to right, transparent, #fff, transparent);
}

.line {
  width: 70%; /* Chiều dài đường line */
  height: 0.6px; /* Độ dày của đường line */
  background: linear-gradient(
    to right,
    transparent,
    #1f445f,
    transparent
  ); /* Tạo hiệu ứng gradient */
  margin: 10px 20px 0px 20px; /* Khoảng cách giữa đường line và text */
}

.social {
  /* background-color: rgba(240, 240, 240, 1); */
  background-color: #fff;
  border-radius: 10px;
  margin: 10px;
}
.social .container {
  border-radius: 50px;
  /* border: 1px solid #1f445f; */
  margin-top: 30px;
  width: 70%;
  color: #1f445f;
  font-size: 22px;
}

.social .sol {
  border-radius: 50px;
  padding: 10px 0;
  border: 1px solid #1f445f;
  text-align: center;
  color: #1f445f;
  font-weight: bold;
}

.social .sol:hover {
  background-color: #1f445f;
  color: white;
}

.logo {
  position: absolute;
  width: 100px;
  top: -10px;
}
</style>
