import { ref } from "vue";

export function useDialog() {
  const dialog = ref({
    show: false,
    type: "alert",
    title: "",
    mainText: "",
    subText: "",
    onConfirm: null,
  });

  function showConfirm(title, mainText, subText, onConfirm) {
    dialog.value = {
      show: true,
      type: "confirm",
      title,
      mainText,
      subText,
      onConfirm,
    };
  }

  function showAlert(title, mainText, subText) {
    dialog.value = {
      show: true,
      type: "alert",
      title,
      mainText,
      subText,
      onConfirm: null,
    };
  }

  function closeDialog(confirmed) {
    dialog.value.show = false;
    if (confirmed && dialog.value.onConfirm) {
      dialog.value.onConfirm();
    }
  }

  return { dialog, showConfirm, showAlert, closeDialog };
}
