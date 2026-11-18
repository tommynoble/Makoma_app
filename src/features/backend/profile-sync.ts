import { slotOfPrompt } from '@/constants/prompts';
import { supabase } from '@/lib/supabase';
import type { OnboardingDraft } from '@/features/onboarding/onboarding-context';
import { isRef, parseRef, toRef, uploadLocal } from './media';
import { myUserId } from './session';

const ext = (uri: string, fallback: string) => uri.match(/\.(\w{3,4})(?:\?|$)/)?.[1]?.toLowerCase() ?? fallback;
const stamp = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Saves the user's profile to Supabase: uploads new photos and the voice
 * intro, creates or updates the profile row, and replaces prompts and photo
 * rows. Returns a patch for the local draft (what is now uploaded).
 */
export async function pushMyProfile(draft: OnboardingDraft): Promise<Partial<OnboardingDraft>> {
  const uid = await myUserId();
  const remote = { photoPaths: { ...(draft.remote?.photoPaths ?? {}) }, voiceUri: draft.remote?.voiceUri, voicePath: draft.remote?.voicePath, created: draft.remote?.created };

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
      path = await uploadLocal('profile-photos', `${uid}/${stamp()}.${e}`, src, e === 'png' ? 'image/png' : 'image/jpeg');
      remote.photoPaths[src] = path;
    }
    photoPaths.push(path);
  }

  // 2. Voice intro.
  if (draft.voiceIntro && draft.voiceIntro.uri !== remote.voiceUri && !isRef(draft.voiceIntro.uri)) {
    remote.voicePath = await uploadLocal('voice-intros', `${uid}/${stamp()}.m4a`, draft.voiceIntro.uri, 'audio/m4a');
    remote.voiceUri = draft.voiceIntro.uri;
  }
  if (!draft.voiceIntro) remote.voicePath = undefined;

  // 3. Profile row. birth_date and gender are set once, at creation.
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
  const { data: existing, error: readErr } = await supabase.from('profiles').select('id').eq('id', uid).maybeSingle();
  if (readErr) throw readErr;
  if (existing) {
    const { error } = await supabase.from('profiles').update(fields).eq('id', uid);
    if (error) throw error;
  } else {
    if (!draft.birthDate || !draft.gender) throw new Error('Add your birthday and gender to finish your profile.');
    const { error } = await supabase.from('profiles').insert({ id: uid, birth_date: draft.birthDate, gender: draft.gender, ...fields });
    if (error) throw error;
  }
  remote.created = true;

  // 4. Prompts and photo rows: replace with the current set.
  const prompts = Object.values(draft.prompts)
    .filter((p) => p.answer.trim())
    .map((p, i) => ({ profile_id: uid, prompt_id: p.promptId, answer: p.answer.trim().slice(0, 250), position: i }));
  const delP = await supabase.from('profile_prompts').delete().eq('profile_id', uid);
  if (delP.error) throw delP.error;
  if (prompts.length) {
    const { error } = await supabase.from('profile_prompts').insert(prompts);
    if (error) throw error;
  }
  const delPh = await supabase.from('photos').delete().eq('profile_id', uid);
  if (delPh.error) throw delPh.error;
  if (photoPaths.length) {
    const { error } = await supabase.from('photos').insert(photoPaths.map((storage_path, position) => ({ profile_id: uid, storage_path, position })));
    if (error) throw error;
  }

  // 5. A selfie taken during onboarding can only be filed once the profile exists.
  if (draft.pendingSelfie) {
    const path = await uploadLocal('verification-selfies', `${uid}/${stamp()}.jpg`, draft.pendingSelfie.uri, 'image/jpeg');
    const { error } = await supabase.from('verification_requests').insert({ profile_id: uid, selfie_path: path, pose: draft.pendingSelfie.pose });
    if (error) throw error;
  }

  return { remote, pendingSelfie: undefined };
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
