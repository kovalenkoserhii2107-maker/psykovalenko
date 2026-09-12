import type { ProfileEntry } from '@/lib/test-scoring';
import { getTest } from '@/lib/tests';

/**
 * Повний профіль егограми — для кабінету психологині.
 *
 * П'ять величин однієї метрики, тож смужки одного кольору: жодна шкала
 * не «краща» за інші, і різні кольори натякали б на протилежне.
 * Підказки під кожною шкалою бачить лише психологиня.
 */
export function TestProfile({
  profile,
  slug,
}: {
  profile: ProfileEntry[];
  slug: string;
}) {
  // описи й підказки лежать у визначенні тесту на сервері, а не в базі
  const scales = getTest(slug)?.scales ?? [];
  const peak = Math.max(...profile.map((entry) => entry.value), 1);
  const average =
    profile.reduce((sum, entry) => sum + entry.value / entry.max, 0) / profile.length;

  return (
    <ul className="flex flex-col gap-4">
      {profile.map((entry) => {
        const scale = scales.find((item) => item.id === entry.id);
        const share = entry.value / entry.max;
        // «Високо» й «низько» — відносно решти профілю, а не абсолютної норми:
        // норм для егограми не існує, має значення лише співвідношення.
        const hint =
          share >= average + 0.1
            ? scale?.hintHigh
            : share <= average - 0.1
              ? scale?.hintLow
              : null;

        return (
          <li key={entry.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-plum">
                {entry.short} · {entry.name}
              </span>
              <span className="text-sm text-muted">
                {entry.value}
                <span className="opacity-60"> / {entry.max}</span>
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgba(46,35,56,.08)]">
              <div
                className="h-full rounded-full bg-plum"
                style={{ width: `${Math.max((entry.value / peak) * 100, 3)}%` }}
              />
            </div>

            {scale ? (
              <p className="mt-1.5 text-xs text-muted">{scale.description}</p>
            ) : null}
            {hint ? (
              <p className="mt-1.5 rounded-xl bg-cream-warm px-3 py-2 text-xs text-plum">
                {hint}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
