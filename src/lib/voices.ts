export type VoiceOption = {
  id: string;
  name: string;
  gender: "Female" | "Male";
  accent: string;
  style: string;
  tagline: string;
  bestFor: string;
};

export const VOICES: VoiceOption[] = [
  {
    id: "katie",
    name: "Katie",
    gender: "Female",
    accent: "American",
    style: "Warm & Friendly",
    tagline: "Reassuring and personable",
    bestFor: "Reactivating lapsed customers",
  },
  {
    id: "john",
    name: "John",
    gender: "Male",
    accent: "American",
    style: "Confident Coach",
    tagline: "Direct, motivating, on-point",
    bestFor: "Booking appointments",
  },
  {
    id: "matt",
    name: "Matt",
    gender: "Male",
    accent: "American",
    style: "Calm Professional",
    tagline: "Composed, premium feel",
    bestFor: "High-ticket consultations",
  },
];

export function getVoice(id?: string | null) {
  return VOICES.find((v) => v.id === id) ?? null;
}
