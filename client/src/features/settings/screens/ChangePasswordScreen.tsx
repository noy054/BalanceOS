import { useState } from 'react';
import { ScrollView, Alert, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { FormInput } from '../../../shared/components/FormInput';
import { useChangePassword } from '../hooks/useSettings';
import { styles } from './styles/ChangePasswordScreen.styles';

export function ChangePasswordScreen() {
  const { t } = useTranslation('settings');
  const changePassword = useChangePassword();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

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
      Alert.alert('', t('changePassword.successMessage'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
          autoFocus
        />
        <FormInput
          label={t('changePassword.newLabel')}
          value={next}
          onChangeText={(v) => { setNext(v); setErrors((e) => ({ ...e, next: undefined })); }}
          error={errors.next}
          secureTextEntry
        />
        <FormInput
          label={t('changePassword.confirmLabel')}
          value={confirm}
          onChangeText={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: undefined })); }}
          error={errors.confirm}
          secureTextEntry
        />

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={changePassword.isPending}
        >
          <Text style={styles.saveBtnText}>
            {changePassword.isPending ? t('changePassword.saving') : t('changePassword.saveButton')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
