'use client';

export default function TestNavigator({
  parts = [],
  activePart = 0,
  currentQuestion = null, // active question number
  onPartChange,
  answeredIds = [],
  partQuestionRanges = [],
  onSubmit,
  onNext,
  onPrev,
}) {
  if (!parts || parts.length === 0) return null;

  const answeredSet = new Set(answeredIds.map(String));

  const getPartStats = (partIndex) => {
    const range = partQuestionRanges[partIndex];
    if (!range) return { total: 0, answered: 0, questions: [] };

    const questions = [];
    for (let i = range.start; i <= range.end; i++) {
      questions.push(i);
    }

    const answered = questions.filter((q) =>
      answeredSet.has(String(q))
    ).length;

    return { total: questions.length, answered, questions };
  };

  const scrollToQuestion = (qNum) => {
    const el = document.getElementById(`question-${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      {/* ── Prev / Next buttons — 15px above navigator, bottom-right ── */}
      <div
        className="fixed flex items-center gap-[1px]"
        style={{ bottom: 'calc(56px + 15px)', right: '16px', zIndex: 41 }}
      >
        <button
          onClick={onPrev}
          disabled={!onPrev}
          title="Previous question"
          className="flex items-center justify-center w-[54px] h-[54px] bg-black hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors outline-none border border-gray-700"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onNext}
          disabled={!onNext}
          title="Next question"
          className="flex items-center justify-center w-[54px] h-[54px] bg-black hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors outline-none border border-gray-700"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ═══ Main Navigator Bar (h-14 = 56px) ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 h-14 flex items-stretch select-none"
        style={{
          zIndex: 40,
          background: 'var(--test-nav-bg)',
          color: 'var(--test-nav-fg)',
          borderTop: '1px solid var(--test-border)',
        }}
      >
        {parts.map((label, idx) => {
          const stats = getPartStats(idx);
          const isActive = idx === activePart;

          if (isActive) {
            return (
              <div
                key={idx}
                className="flex-1 flex items-center gap-2 px-4 overflow-hidden"
                style={{ borderRight: '1px solid var(--test-border)' }}
              >
                {/* Part label */}
                <span className="font-bold text-[13px] whitespace-nowrap mr-3 shrink-0" style={{ color: 'var(--test-nav-fg)' }}>
                  {label}
                </span>

                {/* Question number boxes */}
                <div className="flex items-center gap-[5px] overflow-x-auto ">
                  {stats.questions.map((qNum) => {
                    const isAnswered = answeredSet.has(String(qNum));
                    const isCurrent = currentQuestion === qNum;

                    return (
                      <button
                        key={qNum}
                        onClick={() => scrollToQuestion(qNum)}
                        title={`Go to question ${qNum}`}
                        className={`flex items-center justify-center min-w-[25px] h-[42px] text-[18px] font-semibold shrink-0 outline-none cursor-pointer transition-colors`}
                        style={{
                          border: isCurrent ? '2px solid #2563eb' : `1px solid var(--test-border)`,
                          background: isCurrent ? 'var(--test-bg)' : isAnswered ? 'var(--test-strip-bg)' : 'var(--test-bg)',
                          color: isCurrent ? '#2563eb' : 'var(--test-fg)',
                        }}
                      >
                        {qNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Inactive parts
          return (
            <button
              key={idx}
              onClick={() => onPartChange(idx)}
              className="flex-1 flex items-center justify-center gap-2 transition-colors outline-none cursor-pointer"
              style={{
                borderRight: '1px solid var(--test-border)',
                background: 'var(--test-nav-bg)',
                color: 'var(--test-nav-fg)',
              }}
            >
              <span className="font-bold text-[13px] opacity-60 whitespace-nowrap">
                {label}
              </span>
              <span className="text-[11px] opacity-40 whitespace-nowrap">
                {stats.answered} of {stats.total}
              </span>
            </button>
          );
        })}

        {/* Submit — galochka, o'ng chetda */}
        {onSubmit && (
          <div className="flex items-center px-4 shrink-0" style={{ borderLeft: '1px solid var(--test-border)' }}>
            <button
              onClick={onSubmit}
              className="flex items-center justify-center w-9 h-9 border transition-colors outline-none"
              style={{
                borderColor: 'var(--test-border)',
                background: 'var(--test-nav-bg)',
                color: 'var(--test-nav-fg)',
              }}
              title="Submit test"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}