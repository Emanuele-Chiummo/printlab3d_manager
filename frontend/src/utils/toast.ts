import toast from 'react-hot-toast'

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
  })
}

export const showError = (message: string) => {
  toast.error(message, {
    duration: 5000,
  })
}

export const showInfo = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
    duration: 4000,
  })
}

export const showLoading = (message: string) => {
  return toast.loading(message)
}

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId)
}

export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error: string
  }
) => {
  return toast.promise(promise, messages)
}
