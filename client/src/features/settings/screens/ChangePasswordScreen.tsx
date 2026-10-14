import { useState } from 'react';
import { ScrollView, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { FormInput } from '../../../shared/components/FormInput';
import { useChangePassword } from '../hooks/useSettings';
import { useAppTheme } from '../../../shared/theme';
import { useStyles } from './styles/ChangePasswordScreen.styles';

export function ChangePasswordScreen() {
  const { t } = useTranslation('settings');
  const { colors } = useAppTheme();
  const styles = useStyles();
  const changePassword = useChangePassword();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!current) errs.current = t('errors.saveFailed');
    if (next.length < 8) errs.next = t('changePassword.errorTooShort');
    if (next !== confirm) errs.confirm = t('changePassword.errorMismatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      setSuccess(true);
      setTimeout(() => router.back(), 1500);
    } catch {
      Alert.alert('', t('errors.changePasswordFailed'));
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={t('changePassword.screenTitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormInput
          label={t('changePassword.currentLabel')}
          value={current}
          onChangeText={(v) => { setCurrent(v); setErrors((e) => ({ ...e, current: undefined })); }}
          error={errors.current}
          secureTextEntry
          showPasswordToggle
          autoFocus
        />
        <FormInput
          label={t('changePassword.newLabel')}
          value={next}
          onChangeText={(v) => { setNext(v); setErrors((e) => ({ ...e, next: undefined })); }}
          error={errors.next}
          secureTextEntry
          showPasswordToggle
        />
        <FormInput
          label={t('changePassword.confirmLabel')}
          value={confirm}
          onChangeText={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: undefined })); }}
          error={errors.confirm}
          secureTextEntry
          showPasswordToggle
        />

        {success ? (
          <View style={styles.successBanner}>
            <MaterialCommunityIcons name="check-circle" size={22} color={colors.primaryGreen} />
            <Text style={styles.successText}>{t('changePassword.successMessage')}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            success && styles.saveBtnDisabled,
            pressed && !success && styles.saveBtnPressed,
          ]}
          onPress={handleSave}
          disabled={changePassword.isPending || success}
        >
          <Text style={styles.saveBtnText}>
            {changePassword.isPending ? t('changePassword.saving') : t('changePassword.saveButton')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
