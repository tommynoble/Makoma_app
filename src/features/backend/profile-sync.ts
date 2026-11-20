import { slotOfPrompt } from '@/constants/prompts';
import { supabase } from '@/lib/supabase';
import type { OnboardingDraft } from '@/features/onboarding/onboarding-context';
import { isRef, parseRef, toRef, uploadLocal } from './media';
import { myUserId } from './session';

const ext = (uri: string, fallback: string) => uri.match(/\.(\w{3,4})(?:\?|$)/)?.[1]?.toLowerCase() ?? fallback;
const stamp = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Fails with a clear message instead of hanging forever on a bad connection. */
function step<T>(label: string, work: PromiseLike<T>, ms = 30_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} took too long. Check your connection and try again.`)), ms);
  });
  return Promise.race([Promise.resolve(work), timeout]).finally(() => clearTimeout(timer));
}
async function must<T extends { error: { message: string } | null }>(label: string, work: PromiseLike<T>, ms?: number): Promise<T> {
  const res = await step(label, work, ms);
  if (res.error) throw new Error(`${label}: ${res.error.message}`);
  return res;
}

/**
 * Saves the user's profile to Supabase: uploads new photos and the voice
 * intro, creates or updates the profile row, and replaces prompts and photo
 * rows. Only the profile itself is required: if an extra (voice intro,
 * prompts, selfie) fails, the save still succeeds and the extra is retried on
 * the next save. Progress is reported as it happens so a retry never
 * re-uploads what already went through.
 */
export async function pushMyProfile(draft: OnboardingDraft, onProgress?: (patch: Partial<OnboardingDraft>) => void): Promise<Partial<OnboardingDraft>> {
  const uid = await step('Checking your sign-in', myUserId(), 15_000);
  const remote = { photoPaths: { ...(draft.remote?.photoPaths ?? {}) }, voiceUri: draft.remote?.voiceUri, voicePath: draft.remote?.voicePath, created: draft.remote?.created };
  const progress = () => onProgress?.({ remote: { ...remote, photoPaths: { ...remote.photoPaths } } });
  const problems: string[] = [];

  // 1. Photos: upload anything new. Bundled demo images (numbers) are never uploaded.
  const photoPaths: string[] = [];
  for (const src of draft.photos) {
    if (typeof src !== 'string') continue;
    if (isRef(src)) {
      photoPaths.push(parseRef(src).path);
      continue;
    }
    let path = remote.photoPaths[src];
    if (!path) {
      const e = ext(src, 'jpg');
      path = await step('Uploading a photo', uploadLocal('profile-photos', `${uid}/${stamp()}.${e}`, src, e === 'png' ? 'image/png' : 'image/jpeg'), 60_000);
      remote.photoPaths[src] = path;
      progress();
    }
    photoPaths.push(path);
  }

  // 2. Voice intro (optional: a failure here doesn't block the profile).
  if (draft.voiceIntro && draft.voiceIntro.uri !== remote.voiceUri && !isRef(draft.voiceIntro.uri)) {
    try {
      remote.voicePath = await step('Uploading your voice intro', uploadLocal('voice-intros', `${uid}/${stamp()}.m4a`, draft.voiceIntro.uri, 'audio/m4a'), 60_000);
      remote.voiceUri = draft.voiceIntro.uri;
      progress();
    } catch (e: any) {
      problems.push(e?.message ?? 'voice intro');
    }
  }
  if (!draft.voiceIntro) remote.voicePath = undefined;

  // 3. Profile row (required). birth_date and gender are set once, at creation.
  const fields = {
    first_name: draft.firstName?.trim() ?? '',
    interested_in: draft.interestedIn,
    intent: draft.intent ?? 'serious',
    occupation: draft.occupation?.trim() || null,
    life_goals: draft.lifeGoals?.trim() || null,
    church: draft.church?.trim() || null,
    drinks: draft.drinks ?? null,
    heritage: draft.heritage?.trim() || null,
    hide_exact_distance: draft.hideExactDistance,
    pledge_accepted_at: draft.pledgeAccepted ? new Date().toISOString() : null,
    institution_ids: draft.institutionIds,
    neighborhood: draft.neighborhood || null,
    city: draft.city,
    languages: draft.languages,
    voice_intro_path: remote.voicePath ?? null,
    voice_intro_duration_ms: remote.voicePath ? Math.min(20000, Math.round(draft.voiceIntro?.durationMs ?? 0)) : null,
    voice_prompt_text: remote.voicePath ? (draft.voicePromptText ?? null) : null,
    last_active_at: new Date().toISOString(),
  };
  const { data: existing } = await must('Loading your profile', supabase.from('profiles').select('id').eq('id', uid).maybeSingle());
  if (existing) {
    await must('Saving your profile', supabase.from('profiles').update(fields).eq('id', uid));
  } else {
    if (!draft.birthDate || !draft.gender) throw new Error('Add your birthday and gender to finish your profile.');
    await must('Creating your profile', supabase.from('profiles').insert({ id: uid, birth_date: draft.birthDate, gender: draft.gender, ...fields }));
  }
  remote.created = true;
  progress();

  // 4. Photo rows (required when photos changed) and prompts (optional).
  await must('Saving your photos', supabase.from('photos').delete().eq('profile_id', uid));
  if (photoPaths.length) await must('Saving your photos', supabase.from('photos').insert(photoPaths.map((storage_path, position) => ({ profile_id: uid, storage_path, position }))));
  try {
    const prompts = Object.values(draft.prompts)
      .filter((p) => p.answer.trim())
      .map((p, i) => ({ profile_id: uid, prompt_id: p.promptId, answer: p.answer.trim().slice(0, 250), position: i }));
    await must('Saving your prompts', supabase.from('profile_prompts').delete().eq('profile_id', uid));
    if (prompts.length) await must('Saving your prompts', supabase.from('profile_prompts').insert(prompts));
  } catch (e: any) {
    problems.push(e?.message ?? 'prompts');
  }

  // 5. A selfie taken during onboarding is filed once the profile exists (optional; retried next save).
  let pendingSelfie = draft.pendingSelfie;
  if (pendingSelfie) {
    try {
      const path = await step('Sending your selfie', uploadLocal('verification-selfies', `${uid}/${stamp()}.jpg`, pendingSelfie.uri, 'image/jpeg'), 60_000);
      await must('Sending your selfie', supabase.from('verification_requests').insert({ profile_id: uid, selfie_path: path, pose: pendingSelfie.pose }));
      pendingSelfie = undefined;
    } catch (e: any) {
      problems.push(e?.message ?? 'selfie');
    }
  }

  if (problems.length) console.warn('Profile saved; some extras will retry next time:', problems);
  return { remote, pendingSelfie };
}

/** Loads the user's profile from Supabase (e.g. signing in on a new phone). Null if they have none yet. */
export async function pullMyProfile(): Promise<Partial<OnboardingDraft> | null> {
  const { data, error } = await supabase.rpc('my_profile');
  if (error) throw error;
  const p = data as any;
  if (!p?.id) return null;
  const photos: string[] = (p.photos ?? []).map((ph: any) => toRef('profile-photos', ph.source));
  const prompts: OnboardingDraft['prompts'] = {};
  (p.prompts ?? []).forEach((pr: any, i: number) => (prompts[slotOfPrompt(pr.promptId)?.id ?? `slot${i}`] = { promptId: pr.promptId, answer: pr.answer }));
  return {
    onboarded: true,
    pledgeAccepted: true,
    firstName: p.firstName,
    birthDate: p.birthDate,
    gender: p.gender,
    interestedIn: p.interestedIn ?? [],
    intent: p.intent,
    occupation: p.occupation ?? undefined,
    lifeGoals: p.lifeGoals ?? undefined,
    church: p.church ?? undefined,
    drinks: p.drinks ?? undefined,
    heritage: p.heritage ?? undefined,
    hideExactDistance: p.hideExactDistance,
    institutionIds: p.institutionIds ?? [],
    neighborhood: p.neighborhood ?? '',
    city: p.city,
    languages: p.languages ?? ['en'],
    photos,
    prompts,
    voiceIntro: p.voicePrompt ? { uri: toRef('voice-intros', p.voicePrompt.audioUrl), durationMs: p.voicePrompt.durationMs ?? 0 } : undefined,
    voicePromptText: p.voicePrompt?.promptText ?? undefined,
    selfieSubmitted: p.verification !== 'unverified',
    remote: { photoPaths: {}, voicePath: p.voicePrompt?.audioUrl, voiceUri: p.voicePrompt ? toRef('voice-intros', p.voicePrompt.audioUrl) : undefined, created: true },
  };
}
