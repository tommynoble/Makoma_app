import { useCallback, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';

export const VOICE_NOTE_MAX_MS = 60_000;
export const VOICE_INTRO_MAX_MS = 30_000;

export interface VoiceClip {
  uri: string;
  durationMs: number;
}

/**
 * Hold-to-record voice notes. Voice carries warmth, accent, humour and local
 * language far better than text, so it is a first-class message type.
 */
export function useVoiceRecorder(maxMs = VOICE_NOTE_MAX_MS) {
  const [durationMs, setDurationMs] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    if (status.isFinished) setIsRecording(false);
  });

  const start = useCallback(async () => {
    setError(null);
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setError('Microphone permission is needed to send voice notes.');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setDurationMs(0);
    setIsRecording(true);
  }, [recorder]);

  const stop = useCallback(async (): Promise<VoiceClip | null> => {
    const elapsed = Math.min(recorder.getStatus().durationMillis, maxMs);
    await recorder.stop();
    setIsRecording(false);
    setDurationMs(elapsed);
    await setAudioModeAsync({ allowsRecording: false });
    if (!recorder.uri || elapsed < 800) return null; // ignore accidental taps
    return { uri: recorder.uri, durationMs: elapsed };
  }, [recorder, maxMs]);

  return { start, stop, isRecording, durationMs, error };
}
