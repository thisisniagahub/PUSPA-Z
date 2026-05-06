// Canonical Maria avatar — bundled face asset so chat/widget always render
// even when `public/maria-puspa-reference.png` is not deployed.
import { MARIA_PUSPA_FACE_URI } from '@/lib/puspa-brand-assets'

export const MARIA_PUSPA_AVATAR_URI = MARIA_PUSPA_FACE_URI

/** Optional full reference PNG under `public/` when you ship that file. */
export const MARIA_PUSPA_REFERENCE_PUBLIC_PATH = '/maria-puspa-reference.png'
