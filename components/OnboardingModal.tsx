'use client';
import { useEffect, useState } from 'react';
import { X, Sparkles, Trophy, BookOpen, ArrowRight } from 'lucide-react';

const SEEN_KEY = 'kiffci_onboarding_seen_v1';

const STEPS = [
  {
    icon: Sparkles,
    title: 'Explore par envie',
    text: "Plutôt que de chercher une catégorie, dis-nous ton mood — romantique, nature, entre amis — et on te propose les expériences qui collent.",
    color: 'bg-solar/10 text-solar',
  },
  {
    icon: Trophy,
    title: 'Relève des défis',
    text: 'Des défis saisonniers et thématiques pour explorer la Côte d\'Ivoire différemment, seul ou en groupe.',
    color: 'bg-tropical/10 text-tropical',
  },
  {
    icon: BookOpen,
    title: 'Construis ton passeport',
    text: 'Chaque expérience vécue s\'ajoute à ton passeport personnel : gagne des points, débloque des badges, suis ta progression.',
    color: 'bg-lagoon/10 text-lagoon',
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep]       = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(SEEN_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] px-4 pb-4 sm:pb-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-fadeUp">
        <button onClick={dismiss} aria-label="Fermer" className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition">
          <X size={18} aria-hidden />
        </button>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${current.color}`}>
          <Icon size={24} aria-hidden />
        </div>
        <h2 className="font-display font-bold text-xl text-anthracite mb-2">{current.title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{current.text}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-solar' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
          {isLast ? (
            <button onClick={dismiss}
              className="flex items-center gap-1.5 bg-solar text-white font-medium px-5 py-2.5 rounded-2xl text-sm hover:bg-orange-600 transition">
              Compris, c'est parti ! <ArrowRight size={15} aria-hidden />
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 bg-anthracite text-white font-medium px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 transition">
              Suivant <ArrowRight size={15} aria-hidden />
            </button>
          )}
        </div>

        {!isLast && (
          <button onClick={dismiss} className="block mx-auto mt-4 text-xs text-gray-400 hover:text-gray-600 transition">
            Passer
          </button>
        )}
      </div>
    </div>
  );
}
