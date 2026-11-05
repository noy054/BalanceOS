import { Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { SettingsScreenLayout, useSettingsBottomPadding } from '../components/SettingsScreenLayout';
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
  const bottomPadding = useSettingsBottomPadding();
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
    <SettingsScreenLayout title={t('account.screenTitle')}>

      <ScrollView contentContainerStyle={[styles.content, bottomPadding]} showsVerticalScrollIndicator={false}>
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

        <SettingsSection title={t('account.actionsSection')}>
          <SettingsRow
            icon="logout"
            label={logout.isPending ? t('account.loggingOut') : t('account.logoutButton')}
            onPress={logout.isPending ? undefined : () => logout.mutate()}
            showChevron={false}
            last
          />
        </SettingsSection>

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
    </SettingsScreenLayout>
  );
}
