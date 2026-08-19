import katieAvatar from "@/assets/voices/katie.jpg";
import johnAvatar from "@/assets/voices/john.jpg";
import mattAvatar from "@/assets/voices/matt.jpg";
import katieAudio from "@/assets/voices/audio/katie.m4a?url";
import johnAudio from "@/assets/voices/audio/john.m4a?url";
import mattAudio from "@/assets/voices/audio/matt.m4a?url";

export type VoiceOption = {
  id: string;
  name: string;
  avatar: string;
  preview?: string;
  gender: "Female" | "Male";
  accent: string;
  age: string;
  style: string;
  tagline: string;
  bestFor: string;
};

export const VOICES: VoiceOption[] = [
  {
    id: "katie",
    name: "Katie",
    avatar: katieAvatar,
    preview: katieAudio,
    gender: "Female",
    accent: "American",
    age: "Young Adult",
    style: "Warm & Friendly",
    tagline: "Reassuring and personable",
    bestFor: "Reactivating lapsed customers",
  },
  {
    id: "john",
    name: "John",
    avatar: johnAvatar,
    preview: johnAudio,
    gender: "Male",
    accent: "American",
    age: "Young Adult",
    style: "Confident Coach",
    tagline: "Direct, motivating, on-point",
    bestFor: "Booking appointments",
  },
  {
    id: "matt",
    name: "Matt",
    avatar: mattAvatar,
    preview: mattAudio,
    gender: "Male",
    accent: "American",
    age: "Middle Aged",
    style: "Calm Professional",
    tagline: "Composed, premium feel",
    bestFor: "High-ticket consultations",
  },
];

export function getVoice(id?: string | null) {
  return VOICES.find((v) => v.id === id) ?? null;
}
