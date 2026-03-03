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
        className="fixed bottom-0 left-0 right-0 h-14 flex items-stretch bg-white border-t border-gray-300 select-none"
        style={{ zIndex: 40 }}
      >
        {parts.map((label, idx) => {
          const stats = getPartStats(idx);
          const isActive = idx === activePart;

          if (isActive) {
            return (
              <div
                key={idx}
                className="flex-1 flex items-center gap-2 px-4 border-r border-gray-300 last:border-r-0 overflow-hidden"
              >
                {/* Part label */}
                <span className="font-bold text-[13px] text-gray-900 whitespace-nowrap mr-3 shrink-0">
                  {label}
                </span>

                {/* Question number boxes — 50% bigger: 26→39px wide, 28→42px tall, 12→18px font */}
                <div className="flex items-center gap-[5px] overflow-x-auto no-scrollbar">
                  {stats.questions.map((qNum) => {
                    const isAnswered = answeredSet.has(String(qNum));
                    const isCurrent = currentQuestion === qNum;

                    return (
                      <button
                        key={qNum}
                        onClick={() => scrollToQuestion(qNum)}
                        title={`Go to question ${qNum}`}
                        className={`flex items-center justify-center min-w-[29px] h-[42px] text-[18px] font-semibold shrink-0 outline-none cursor-pointer transition-colors
                          ${isCurrent
                            ? 'border-2 border-blue-600 text-blue-700 bg-white'
                            : isAnswered
                            ? 'border border-gray-700 bg-gray-300 text-gray-900 hover:bg-gray-200'
                            : 'border border-gray-400 bg-white text-gray-800 hover:border-gray-600 hover:bg-gray-50'
                          }
                        `}
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
              className="flex-1 flex items-center justify-center gap-2 border-r border-gray-300 last:border-r-0 bg-white hover:bg-gray-50 transition-colors outline-none cursor-pointer"
            >
              <span className="font-bold text-[13px] text-gray-500 whitespace-nowrap">
                {label}
              </span>
              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                {stats.answered} of {stats.total}
              </span>
            </button>
          );
        })}

        {/* Submit — galochka, o'ng chetda */}
        {onSubmit && (
          <div className="flex items-center px-4 border-l border-gray-300 shrink-0">
            <button
              onClick={onSubmit}
              className="flex items-center justify-center w-9 h-9 border border-gray-300 bg-white hover:bg-gray-100 transition-colors outline-none"
              title="Submit test"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}