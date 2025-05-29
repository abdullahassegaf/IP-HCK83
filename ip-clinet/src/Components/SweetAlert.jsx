import Swal from "sweetalert2";

// Konfigurasi default untuk SweetAlert
const defaultConfig = {
   showConfirmButton: true,
   timer: 3000,
   timerProgressBar: true,
   toast: true,
   position: "top-end",
   showCloseButton: true,
   didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
   },
};

// Success notification
export const showSuccess = (message, options = {}) => {
   return Swal.fire({
      ...defaultConfig,
      icon: "success",
      title: "Berhasil!",
      text: message,
      ...options,
   });
};

// Error notification
export const showError = (message, options = {}) => {
   return Swal.fire({
      ...defaultConfig,
      icon: "error",
      title: "Error!",
      text: message,
      timer: 5000,
      ...options,
   });
};

// Warning notification
export const showWarning = (message, options = {}) => {
   return Swal.fire({
      ...defaultConfig,
      icon: "warning",
      title: "Peringatan!",
      text: message,
      timer: 4000,
      ...options,
   });
};

// Info notification
export const showInfo = (message, options = {}) => {
   return Swal.fire({
      ...defaultConfig,
      icon: "info",
      title: "Info",
      text: message,
      ...options,
   });
};

// Loading notification
export const showLoading = (message = "Memproses...") => {
   return Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      didOpen: () => {
         Swal.showLoading();
      },
   });
};

// Confirmation dialog
export const showConfirmation = (message, options = {}) => {
   return Swal.fire({
      title: "Konfirmasi",
      text: message,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
      ...options,
   });
};

// Custom notification
export const showCustom = (config) => {
   return Swal.fire(config);
};

// Close any open SweetAlert
export const closeSwal = () => {
   Swal.close();
};

// Default export untuk backward compatibility
const SweetAlert = {
   success: showSuccess,
   error: showError,
   warning: showWarning,
   info: showInfo,
   loading: showLoading,
   confirm: showConfirmation,
   custom: showCustom,
   close: closeSwal,
};

export default SweetAlert;
