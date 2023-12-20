const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 이미지 로드 함수
function loadImages(imageSources) {
  return Promise.all(
    imageSources.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
        img.src = src;
      });
    })
  );
}

// 이미지 경로
    const imageSource = "assets/snowhill.png";

    // 이미지 로드 및 그리기
    loadImage(imageSource)
      .then((img) => {
        // 이미지를 캔버스 하단에 그립니다.
        ctx.drawImage(img, 0, canvas.height - img.height, canvas.width, img.height);
      })
      .catch((error) => {
        console.error("Error loading image:", error);
      });