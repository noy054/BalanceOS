import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsRow } from '../components/SettingsRow';
import { useDeleteAccount } from '../hooks/useSettings';
import { useLogout } from '../../auth/hooks/useAuth';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { styles } from './styles/AccountSecurityScreen.styles';

export function AccountSecurityScreen() {
  const { t } = useTranslation('settings');
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();

  const isGoogleUser = user?.provider === 'google';

  function handleDeleteAccount() {
    Alert.alert(
      t('deleteAccount.confirmTitle'),
      t('deleteAccount.confirmMessage'),
      [
        { text: t('deleteAccount.confirmNo'), style: 'cancel' },
        {
          text: t('deleteAccount.confirmYes'),
          style: 'destructive',
          onPress: () =>
            deleteAccount.mutate(undefined, {
              onError: () => Alert.alert('', t('errors.deleteAccountFailed')),
            }),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('account.screenTitle')} />

      <View style={styles.content}>
        {/* Security */}
        <SettingsSection title={t('account.securitySection')}>
          {isGoogleUser ? (
            <SettingsRow
              label={t('account.googleAccount')}
              hint={t('account.googleAccountHint')}
              showChevron={false}
              last
            />
          ) : (
            <SettingsRow
              label={t('account.changePassword')}
              hint={t('account.changePasswordHint')}
              onPress={() => router.push('/(app)/settings/change-password')}
              last
            />
          )}
        </SettingsSection>

        {/* Logout */}
        <View style={styles.logoutWrapper}>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]}
            onPress={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <Text style={styles.logoutText}>
              {logout.isPending ? t('account.loggingOut') : t('account.logoutButton')}
            </Text>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <SettingsSection title={t('account.dangerSection')} danger>
          <SettingsRow
            label={t('account.deleteAccount')}
            hint={t('account.deleteAccountHint')}
            onPress={handleDeleteAccount}
            destructive
            showChevron={false}
            last
          />
        </SettingsSection>
      </View>
    </SafeAreaView>
  );
}
