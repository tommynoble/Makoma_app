import { useRef, type ComponentRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { CSS_EASE_OUT, durations } from '@/lib/motion';
import { colors, fonts, radius, spacing } from '@/theme';
import { Text } from './text';

/**
 * 6-digit SMS code input: six boxes over one hidden field, so paste,
 * autofill (one-time-code) and backspace all behave natively.
 */
export function CodeInput({ value, onChange, length = 6, error }: { value: string; onChange: (v: string) => void; length?: number; error?: boolean }) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Pressable accessibilityRole="none" onPress={() => input.current?.focus()}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' }}>
        {Array.from({ length }, (_, i) => {
          const ch = value[i] ?? '';
          const active = i === Math.min(value.length, length - 1);
          return (
            <Animated.View
              key={i}
              style={{
                flex: 1,
                aspectRatio: 0.82,
                maxWidth: 52,
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: error ? colors.error : active ? colors.primaryContainer : colors.hairline,
                backgroundColor: colors.surfaceContainerLowest,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: ch ? 1 : 0.97 }],
                transitionProperty: ['borderColor', 'transform'],
                transitionDuration: durations.state,
                transitionTimingFunction: CSS_EASE_OUT,
              }}
            >
              <Text style={{ fontFamily: fonts.sansBold, fontSize: 24, color: colors.onSurface }}>{ch}</Text>
            </Animated.View>
          );
        })}
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus
        accessibilityLabel={`Verification code, ${length} digits`}
        caretHidden
        style={{ position: 'absolute', inset: 0, opacity: 0.02, color: 'transparent' }}
      />
    </Pressable>
  );
}
