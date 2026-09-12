'use client';

import Link from 'next/link';
import { useActionState, useCallback, useEffect, useRef, useState } from 'react';

import type { TestSubmitState } from '@/lib/test-scoring';
import type { TestDefinition } from '@/lib/tests';

const initial: TestSubmitState = {};

const respondentField =
  'w-full rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none focus:border-plum/40 focus:bg-white';

/** Що робити з відповідями: кабінет клієнта і публічне посилання дають різні дії. */
type SubmitAction = (
  state: TestSubmitState,
  formData: FormData,
) => Promise<TestSubmitState>;

/** Прибираємо розділові знаки й зводимо до нижнього регістру для звірки з варіантами. */
const normalize = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();

export function TestWizard({
  test,
  action,
  hidden,
  doneHref,
  doneLabel,
  askRespondent = false,
}: {
  test: TestDefinition;
  action: SubmitAction;
  /** Поля, що їдуть разом з відповідями: slug у кабінеті, token за посиланням */
  hidden: Record<string, string>;
  doneHref?: string;
  doneLabel?: string;
  /** Стороння людина називає себе сама — у кабінеті ім'я вже відоме */
  askRespondent?: boolean;
}) {
  const total = test.questions.length;
  const [step, setStep] = useState(0); // 0..total-1 — питання, total — відкрите питання
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [respondent, setRespondent] = useState({ name: '', email: '' });
  const [listening, setListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [speechReady, setSpeechReady] = useState({ speak: false, listen: false });

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    setSpeechReady({
      speak: typeof window !== 'undefined' && 'speechSynthesis' in window,
      listen:
        typeof window !== 'undefined' &&
        Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    });
    return () => {
      recognitionRef.current?.abort();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const question = test.questions[step];
  const isOpenStep = step === total;

  // --- прочитати вголос ---
  const speak = useCallback(() => {
    if (!speechReady.speak) return;
    window.speechSynthesis.cancel();

    const text = isOpenStep
      ? test.openQuestion
      : `${question.text}. Варіанти: ${test.options.map((o) => o.label).join(', ')}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uk-UA';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [isOpenStep, question, test.openQuestion, test.options, speechReady.speak]);

  // --- сказати відповідь ---
  const listen = useCallback(() => {
    if (!speechReady.listen) return;
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = 'uk-UA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceHint(null);
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      if (isOpenStep) {
        setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
        return;
      }

      const said = normalize(transcript);
      const match = test.options.find((option) =>
        option.spoken.some((variant) => said.includes(normalize(variant))),
      );

      if (match) {
        setAnswers((prev) => ({ ...prev, [question.id]: match.value }));
        setVoiceHint(`Записано: ${match.label}`);
      } else {
        setVoiceHint(`Не розпізнала «${transcript}». Скажіть інакше або торкніться варіанта.`);
      }
    };
    recognition.onerror = () => {
      setVoiceHint('Мікрофон недоступний. Оберіть варіант дотиком.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognition.start();
  }, [isOpenStep, question, test.options, speechReady.listen]);

  const choose = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setVoiceHint(null);
    window.setTimeout(() => setStep((s) => Math.min(s + 1, total)), 180);
  };

  // --- результат ---
  // Клієнту показуємо коротко, без балів і тлумачень: розбір — робота
  // психологині на зустрічі, а цифра без контексту лише лякає.
  if (state.done) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-3xl border border-white/70 bg-white/60 p-7 text-center backdrop-blur-xl">
          <p className="font-display text-3xl text-plum">Дякую</p>
          <p className="mt-3 text-sm text-muted">
            Відповіді збережено — психологиня подивиться їх перед зустріччю.
          </p>
          {state.headline ? (
            <p className="mt-4 text-sm text-plum">
              Найпомітніший стан у ваших відповідях — <b>{state.headline}</b>.
            </p>
          ) : null}
          <p className="mt-4 text-xs text-muted">
            Розбір — на сесії: без контексту окремі цифри мало що означають.
          </p>
        </div>

        {doneHref ? (
          <Link
            href={doneHref}
            className="rounded-full bg-plum py-3.5 text-center text-base font-medium text-white"
          >
            {doneLabel ?? 'Далі'}
          </Link>
        ) : null}
      </div>
    );
  }

  const progress = Math.round((step / (total + 1)) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full bg-mint-deep transition-all duration-300"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
        <p className="mt-2 px-1 text-xs text-muted">
          {isOpenStep ? 'Останнє запитання' : `Запитання ${step + 1} з ${total}`}
        </p>
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
        {!isOpenStep ? (
          <p className="mb-1 text-xs text-muted">{test.scaleHint}</p>
        ) : null}

        <h2 className="font-display text-2xl leading-snug text-plum">
          {isOpenStep ? test.openQuestion : question.text}
        </h2>

        {/* --- голос --- */}
        {speechReady.speak || speechReady.listen ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {speechReady.speak ? (
              <button
                type="button"
                onClick={speak}
                className="rounded-full border border-[rgba(46,35,56,.2)] px-4 py-2 text-sm text-plum"
              >
                Прослухати
              </button>
            ) : null}
            {speechReady.listen ? (
              <button
                type="button"
                onClick={listen}
                disabled={listening}
                className="rounded-full bg-mint px-4 py-2 text-sm text-plum disabled:opacity-60"
              >
                {listening ? 'Слухаю…' : 'Сказати відповідь'}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted">
            Голосові кнопки працюють у Safari на iPhone і в Chrome.
          </p>
        )}

        {voiceHint ? <p className="mt-3 text-sm text-muted">{voiceHint}</p> : null}

        {/* --- варіанти або текст --- */}
        {isOpenStep ? (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="Можна написати або надиктувати. Можна пропустити."
              className="mt-5 w-full resize-y rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none focus:border-plum/40 focus:bg-white"
            />
            {askRespondent ? (
              <div className="mt-4 flex flex-col gap-2">
                <input
                  value={respondent.name}
                  onChange={(e) => setRespondent({ ...respondent, name: e.target.value })}
                  placeholder="Як до вас звертатись — не обов’язково"
                  className={respondentField}
                />
                <input
                  type="email"
                  value={respondent.email}
                  onChange={(e) => setRespondent({ ...respondent, email: e.target.value })}
                  placeholder="Пошта, якщо хочете відповідь — не обов’язково"
                  className={respondentField}
                />
              </div>
            ) : null}
          </>
        ) : (
          <ul className="mt-5 flex flex-col gap-2">
            {test.options.map((option) => {
              const active = answers[question.id] === option.value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => choose(option.value)}
                    className={`w-full rounded-2xl px-5 py-4 text-left text-base transition ${
                      active
                        ? 'bg-plum text-white'
                        : 'bg-cream-warm text-plum active:bg-mint'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* --- навігація --- */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full px-5 py-3 text-sm text-muted disabled:opacity-40"
        >
          Назад
        </button>

        {isOpenStep ? (
          <form action={formAction}>
            {Object.entries(hidden).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <input type="hidden" name="answers" value={JSON.stringify(answers)} />
            <input type="hidden" name="note" value={note} />
            {askRespondent ? (
              <>
                <input type="hidden" name="respondentName" value={respondent.name} />
                <input type="hidden" name="respondentEmail" value={respondent.email} />
              </>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-plum px-7 py-3.5 text-base font-medium text-white disabled:opacity-50"
            >
              {pending ? 'Зберігаємо…' : 'Завершити'}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(s + 1, total))}
            disabled={answers[question.id] === undefined}
            className="rounded-full bg-plum px-7 py-3.5 text-base font-medium text-white disabled:opacity-40"
          >
            Далі
          </button>
        )}
      </div>

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
