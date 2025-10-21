import toast from "react-hot-toast";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        border: "2px solid hsl(145 65% 50%)",
        borderLeft: "4px solid hsl(145 65% 50%)",
        padding: "16px",
        borderRadius: "0.5rem",
      },
      iconTheme: {
        primary: "hsl(145 65% 50%)",
        secondary: "#fff",
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        border: "2px solid hsl(355 75% 55%)",
        borderLeft: "4px solid hsl(355 75% 55%)",
        padding: "16px",
        borderRadius: "0.5rem",
      },
      iconTheme: {
        primary: "hsl(355 75% 55%)",
        secondary: "#fff",
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: "top-right",
      icon: "ℹ️",
      style: {
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        border: "2px solid hsl(220 85% 55%)",
        borderLeft: "4px solid hsl(220 85% 55%)",
        padding: "16px",
        borderRadius: "0.5rem",
      },
    });
  },
  loading: (message: string) => {
    return toast.loading(message, {
      position: "top-right",
      style: {
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        border: "2px solid hsl(250 75% 60%)",
        borderLeft: "4px solid hsl(250 75% 60%)",
        padding: "16px",
        borderRadius: "0.5rem",
      },
    });
  },
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};
