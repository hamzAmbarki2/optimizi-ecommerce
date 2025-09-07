import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { EnhancedNotification, NotificationPreferences } from '../types/notifications';
import { EmailTemplateService } from './emailTemplateService';
import { EnhancedNotificationService } from './enhancedNotificationService';

export class DigestService {
  // Send daily digest to suppliers who have it enabled
  static async sendDailyDigests(): Promise<void> {
    try {
      console.log('🔄 [Digest] Starting daily digest process...');
      
      // Get all suppliers with daily digest enabled
      const preferencesQuery = query(
        collection(db, 'notificationPreferences'),
        where('dailyDigest', '==', true),
        where('emailNotifications', '==', true)
      );
      
      const preferencesSnapshot = await getDocs(preferencesQuery);
      
      for (const prefDoc of preferencesSnapshot.docs) {
        const preferences = prefDoc.data() as NotificationPreferences;
        await this.sendDigestForSupplier(preferences.fournisseurId, 'daily');
      }
      
      console.log(`✅ [Digest] Daily digest sent to ${preferencesSnapshot.size} suppliers`);
    } catch (error) {
      console.error('❌ [Digest] Error sending daily digests:', error);
    }
  }

  // Send weekly digest to suppliers who have it enabled
  static async sendWeeklyDigests(): Promise<void> {
    try {
      console.log('🔄 [Digest] Starting weekly digest process...');
      
      const preferencesQuery = query(
        collection(db, 'notificationPreferences'),
        where('weeklyDigest', '==', true),
        where('emailNotifications', '==', true)
      );
      
      const preferencesSnapshot = await getDocs(preferencesQuery);
      
      for (const prefDoc of preferencesSnapshot.docs) {
        const preferences = prefDoc.data() as NotificationPreferences;
        await this.sendDigestForSupplier(preferences.fournisseurId, 'weekly');
      }
      
      console.log(`✅ [Digest] Weekly digest sent to ${preferencesSnapshot.size} suppliers`);
    } catch (error) {
      console.error('❌ [Digest] Error sending weekly digests:', error);
    }
  }

  // Send digest for a specific supplier
  private static async sendDigestForSupplier(
    fournisseurId: string, 
    period: 'daily' | 'weekly'
  ): Promise<void> {
    try {
      // Get supplier info
      const fournisseurQuery = query(
        collection(db, 'Fournisseurs'),
        where('id', '==', fournisseurId)
      );
      const fournisseurSnapshot = await getDocs(fournisseurQuery);
      
      if (fournisseurSnapshot.empty) {
        console.warn(`⚠️ [Digest] Supplier ${fournisseurId} not found`);
        return;
      }
      
      const fournisseurData = fournisseurSnapshot.docs[0].data();
      const fournisseurName = fournisseurData.name || 'Supplier';

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      if (period === 'daily') {
        startDate.setDate(now.getDate() - 1);
      } else {
        startDate.setDate(now.getDate() - 7);
      }

      // Get notifications for the period
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('fournisseurId', '==', fournisseurId),
        where('createdAt', '>=', startDate.toISOString()),
        where('createdAt', '<=', now.toISOString())
      );
      
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedNotification[];

      if (notifications.length === 0) {
        console.log(`📭 [Digest] No notifications for supplier ${fournisseurId} in the last ${period}`);
        return;
      }

      // Generate digest email
      const emailHtml = EmailTemplateService.generateDigestTemplate(
        notifications,
        fournisseurName,
        period
      );

      // In production, send email using your email service
      console.log(`📧 [Digest] Generated ${period} digest for ${fournisseurName} with ${notifications.length} notifications`);
      
      // Log digest creation
      await addDoc(collection(db, 'digestLogs'), {
        fournisseurId,
        fournisseurName,
        period,
        notificationCount: notifications.length,
        sentAt: new Date().toISOString(),
        emailSent: true // Would be actual result from email service
      });

    } catch (error) {
      console.error(`❌ [Digest] Error sending ${period} digest for supplier ${fournisseurId}:`, error);
    }
  }

  // Get digest statistics
  static async getDigestStats(fournisseurId: string): Promise<{
    dailyDigestsReceived: number;
    weeklyDigestsReceived: number;
    lastDailyDigest?: string;
    lastWeeklyDigest?: string;
    averageNotificationsPerDigest: number;
  }> {
    try {
      const digestLogsQuery = query(
        collection(db, 'digestLogs'),
        where('fournisseurId', '==', fournisseurId)
      );
      
      const snapshot = await getDocs(digestLogsQuery);
      const logs = snapshot.docs.map(doc => doc.data());
      
      const dailyLogs = logs.filter(log => log.period === 'daily');
      const weeklyLogs = logs.filter(log => log.period === 'weekly');
      
      const totalNotifications = logs.reduce((sum, log) => sum + (log.notificationCount || 0), 0);
      const averageNotificationsPerDigest = logs.length > 0 ? totalNotifications / logs.length : 0;
      
      return {
        dailyDigestsReceived: dailyLogs.length,
        weeklyDigestsReceived: weeklyLogs.length,
        lastDailyDigest: dailyLogs.length > 0 ? dailyLogs[dailyLogs.length - 1].sentAt : undefined,
        lastWeeklyDigest: weeklyLogs.length > 0 ? weeklyLogs[weeklyLogs.length - 1].sentAt : undefined,
        averageNotificationsPerDigest
      };
    } catch (error) {
      console.error('Error getting digest stats:', error);
      return {
        dailyDigestsReceived: 0,
        weeklyDigestsReceived: 0,
        averageNotificationsPerDigest: 0
      };
    }
  }

  // Schedule digest sending (would be called by a cron job or scheduler)
  static async scheduleDigests(): Promise<void> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Send daily digests at 8 AM
    if (hour === 8) {
      await this.sendDailyDigests();
    }

    // Send weekly digests on Monday at 9 AM
    if (dayOfWeek === 1 && hour === 9) {
      await this.sendWeeklyDigests();
    }
  }
}