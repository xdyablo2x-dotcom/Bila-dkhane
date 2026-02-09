
export const notificationService = {
  requestPermission: async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const res = await Notification.requestPermission();
    return res === 'granted';
  },

  send: async (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        reg.showNotification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          vibrate: [200, 100, 200],
          tag: 'bila-elite'
        } as any);
      } else {
        new Notification(title, { body });
      }
    }
  },

  notifyLevelUp: (level: number, title: string) => {
    notificationService.send(`🎖️ GRADE ÉLEVÉ`, `Agent, vous êtes NIVEAU ${level} : ${title}.`);
  },

  notifySuccess: (days: number) => {
    notificationService.send(`✅ CYCLE VALIDÉ`, `J+${days} accompli. Système synchronisé.`);
  }
};
