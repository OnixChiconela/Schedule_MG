import api from "../../api"

export const markMessageAsRead = async (messageId: string, userId: string) => {
    try {
        const res = await api.post(`/notifications/messages/${messageId}/read`, { userId }, {
            withCredentials: true
        })
        res.data
    } catch (error) {
        console.error("Failed to mark message as read:", error);
        throw new Error("Failed to mark message as read");
    }
}

export const markSystemAlertAsRead = async (notificationId: string, userId: string) => {
  try {
    const res = await api.post(
      `/notifications/${notificationId}/read`,
      { userId },
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to mark system alert as read:", error);
    throw new Error("Failed to mark system alert as read");
  }
};

export const markAllMessagesAsRead = async (userId: string) => {
  try {
    const res = await api.post(`/notifications/messages/read/bulk`, { userId }, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    return res.data;
  } catch (error) {
    console.error('Failed to mark all messages as read:', error);
    throw new Error('Failed to mark all messages as read');
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const res = await api.post(`/notifications/notifications/read/bulk`, { userId }, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    return res.data;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
};