const fileInput = document.getElementById("file");
const uploadBtn = document.getElementById("uploadBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");

uploadBtn.addEventListener("click", () => {
const file = fileInput.files[0];

if (!file) {
    statusBox.textContent = "لطفاً ابتدا یک فایل انتخاب کنید.";
    return;
}

statusBox.textContent =
    "فایل انتخاب شد: " + file.name +
    " | حجم: " + (file.size / 1024 / 1024).toFixed(2) + " MB";

resultBox.textContent =
    "برای دریافت لینک دانلود واقعی، سرویس ذخیره‌سازی باید متصل شود.";

});
