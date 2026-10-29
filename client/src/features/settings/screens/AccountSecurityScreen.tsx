import { View, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { Button } from '../../../shared/components/ui/Button';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsRow } from '../components/SettingsRow';
import { useDeleteAccount } from '../hooks/useSettings';
import { useLogout } from '../../auth/hooks/useAuth';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { useStyles } from './styles/AccountSecurityScreen.styles';
import { confirmAction } from '../../../shared/helpers/confirm';

export function AccountSecurityScreen() {
  const { t } = useTranslation('settings');
  const styles = useStyles();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();

  const isGoogleUser = user?.provider === 'google';

  async function handleDeleteAccount() {
    const confirmed = await confirmAction({
      title: t('deleteAccount.confirmTitle'),
      message: t('deleteAccount.confirmMessage'),
      confirmLabel: t('deleteAccount.confirmYes'),
      cancelLabel: t('deleteAccount.confirmNo'),
      destructive: true,
    });
    if (!confirmed) return;
    deleteAccount.mutate(undefined, {
      onError: () => Alert.alert('', t('errors.deleteAccountFailed')),
    });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('account.screenTitle')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsSection title={t('account.securitySection')}>
          {isGoogleUser ? (
            <SettingsRow
              icon="google"
              label={t('account.googleAccount')}
              hint={t('account.googleAccountHint')}
              showChevron={false}
              last
            />
          ) : (
            <SettingsRow
              icon="lock-outline"
              label={t('account.changePassword')}
              hint={t('account.changePasswordHint')}
              onPress={() => router.push('/(app)/settings/change-password')}
              last
            />
          )}
        </SettingsSection>

        <View style={styles.logoutWrapper}>
          <Button
            label={logout.isPending ? t('account.loggingOut') : t('account.logoutButton')}
            icon="logout"
            variant="secondary"
            onPress={() => logout.mutate()}
            loading={logout.isPending}
            fullWidth
          />
        </View>

        <SettingsSection title={t('account.dangerSection')} danger>
          <SettingsRow
            icon="trash-can-outline"
            label={t('account.deleteAccount')}
            hint={t('account.deleteAccountHint')}
            onPress={handleDeleteAccount}
            destructive
            showChevron={false}
            last
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
