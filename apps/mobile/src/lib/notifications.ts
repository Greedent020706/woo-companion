import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { formatPrice, type Order } from '@woo/shared';

const ORDERS_CHANNEL_ID = 'orders';

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ORDERS_CHANNEL_ID, {
      name: 'Pedidos',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  if (currentPermission.granted) return true;

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.granted;
}

export async function notifyOrderPlaced(order: Order): Promise<boolean> {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Pedido confirmado!',
      body: `Tu pedido #${order.number} de ${formatPrice(order.total, order.currency)} se está preparando.`,
      data: { orderId: order.id },
    },
    trigger: Platform.OS === 'android' ? { channelId: ORDERS_CHANNEL_ID } : null,
  });
  return true;
}
