import React from 'react';
import { Check, Lock } from 'lucide-react';
import { ET } from './EditableText';
import { toast } from 'sonner';

interface SubscriptionTimelineProps {
  hasSubscription: boolean;
}

const REWARD_MONTHS = [3, 6, 9, 12];
const TOTAL_MONTHS = 12;

export function SubscriptionTimeline({ hasSubscription }: SubscriptionTimelineProps) {
  const months = Array.from({ length: TOTAL_MONTHS }, (_, i) => i + 1);
  const isRewardMonth = (m: number) => REWARD_MONTHS.includes(m);
  const isChecked = (m: number) => hasSubscription && (m === 1 || m === 2);
  const isFilled = (m: number) => hasSubscription && m <= 2;

  return (
    <div>
      {/* Title & Subtitle */}
      <div className="mb-5 text-center">
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            fontStyle: 'italic',
            marginBottom: '4px',
            fontFamily: "'DM Sans', sans-serif",
            color: '#1a1a1a',
          }}
        >
          {hasSubscription ? <ET k="timeline.subTitle" /> : <ET k="timeline.noSubTitle" />}
        </h3>
        <p
          style={{
            fontSize: '14px',
            fontStyle: 'italic',
            color: '#777',
            margin: 0,
          }}
        >
          {hasSubscription ? <ET k="timeline.subSubtitle" /> : <ET k="timeline.noSubSubtitle" />}
        </p>
      </div>

      {/* ─── DESKTOP: Horizontal Timeline with alternating above/below ─── */}
      <div className="hidden md:block">
        <div className="relative" style={{ height: '160px', padding: '0 52px 0 36px' }}>
          {/* ── The horizontal bar ── */}
          <div
            className="absolute"
            style={{
              top: '72px',
              height: '4px',
              left: '36px',
              right: '52px',
              backgroundColor: '#e0e0e0',
              borderRadius: '2px',
            }}
          />
          {/* ── Filled portion (subscription only, through month 2) ── */}
          {hasSubscription && (
            <div
              className="absolute"
              style={{
                top: '72px',
                height: '4px',
                left: '36px',
                width: `${((1.5) / (TOTAL_MONTHS - 1)) * 100}%`,
                backgroundColor: '#1a1a1a',
                borderRadius: '2px',
                zIndex: 1,
              }}
            />
          )}

          {/* ── Inner container for nodes ── */}
          <div className="relative h-full">
            {/* ── Month nodes positioned along the bar ── */}
            {months.map((m) => {
              const isReward = isRewardMonth(m);
              const isCheck = isChecked(m);
              const isOdd = m % 2 !== 0;
              const left = `${((m - 1) / (TOTAL_MONTHS - 1)) * 100}%`;

              return (
                <div
                  key={m}
                  className="absolute flex flex-col items-center"
                  style={{
                    left,
                    transform: 'translateX(-50%)',
                    top: isOdd ? '0px' : '80px',
                    width: '72px',
                  }}
                >
                  {isOdd ? (
                    /* ── ABOVE THE BAR: label on top, node at bottom ── */
                    <>
                      {isReward && (
                        <div className="flex items-center gap-1 mb-1">
                          <Lock size={12} className="text-[#C8102E]" />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#C8102E', whiteSpace: 'nowrap' }}>
                            Free product!
                          </span>
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: '11px',
                          color: isCheck ? '#1a1a1a' : '#888',
                          fontWeight: isReward || isCheck ? 600 : 400,
                          whiteSpace: 'nowrap',
                          marginBottom: '6px',
                        }}
                      >
                        {isCheck && <span style={{ color: '#1a1a1a' }}>✓</span>} Month {m}
                      </span>
                      {/* Node on the bar */}
                      {isReward ? (
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: '#e0e0e0',
                          }}
                        >
                          <Lock size={13} className="text-[#1a1a1a]" />
                        </div>
                      ) : isCheck ? (
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{ width: '20px', height: '20px', backgroundColor: '#1a1a1a' }}
                        >
                          <Check size={12} className="text-white" />
                        </div>
                      ) : (
                        <div
                          className="rounded-full"
                          style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#e0e0e0',
                          }}
                        />
                      )}
                    </>
                  ) : (
                    /* ── BELOW THE BAR: node on top, label at bottom ── */
                    <>
                      {isReward ? (
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: '#e0e0e0',
                          }}
                        >
                          <Lock size={13} className="text-[#1a1a1a]" />
                        </div>
                      ) : isCheck ? (
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{ width: '20px', height: '20px', backgroundColor: '#1a1a1a' }}
                        >
                          <Check size={12} className="text-white" />
                        </div>
                      ) : (
                        <div
                          className="rounded-full"
                          style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#e0e0e0',
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: '11px',
                          color: isCheck ? '#1a1a1a' : '#888',
                          fontWeight: isReward || isCheck ? 600 : 400,
                          whiteSpace: 'nowrap',
                          marginTop: '6px',
                        }}
                      >
                        {isCheck && <span style={{ color: '#1a1a1a' }}>✓</span>} Month {m}
                      </span>
                      {isReward && (
                        <div className="flex items-center gap-1 mt-1">
                          <Lock size={12} className="text-[#C8102E]" />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#C8102E', whiteSpace: 'nowrap' }}>
                            Free product!
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── MOBILE: Vertical Center-aligned with alternating left/right ─── */}
      <div className="md:hidden">
        <div className="relative" style={{ width: '100%' }}>
          {/* ── Single continuous vertical line behind all nodes ── */}
          <div
            className="absolute"
            style={{
              width: '3px',
              top: '0',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#e0e0e0',
              zIndex: 0,
            }}
          />
          {/* ── Filled portion overlay (subscription only, through month 2) ── */}
          {hasSubscription && (
            <div
              className="absolute"
              style={{
                width: '3px',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#1a1a1a',
                /* Fill through month 2 — each row is ~40px avg, so 2 rows ≈ 80px + some extra */
                height: `${(2 / TOTAL_MONTHS) * 100}%`,
                zIndex: 1,
              }}
            />
          )}

          {months.map((m, idx) => {
            const isReward = isRewardMonth(m);
            const isCheck = isChecked(m);
            const isOdd = m % 2 !== 0;
            const isLast = idx === months.length - 1;

            const rowH = isReward ? 48 : 36;

            return (
              <div
                key={m}
                className="relative flex items-center"
                style={{
                  height: `${rowH}px`,
                  marginBottom: isLast ? '0' : '4px',
                }}
              >
                {/* ── Left side (odd months label, even months empty) ── */}
                <div
                  className="flex-1 flex items-center"
                  style={{ justifyContent: 'flex-end', paddingRight: '16px' }}
                >
                  {isOdd && (
                    <div className="flex flex-col items-end">
                      {isReward && (
                        <div className="flex items-center gap-1">
                          <Lock size={11} className="text-[#C8102E]" />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#C8102E' }}>Free product!</span>
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: '12px',
                          color: isCheck ? '#1a1a1a' : '#888',
                          fontWeight: isReward || isCheck ? 600 : 400,
                        }}
                      >
                        {isCheck && '✓ '}Month {m}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Center: dot/icon only (line is behind via absolute) ── */}
                <div className="relative flex items-center justify-center" style={{ width: '28px', flexShrink: 0, zIndex: 2 }}>
                  {isReward ? (
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: '26px',
                        height: '26px',
                        backgroundColor: '#e0e0e0',
                      }}
                    >
                      <Lock size={12} className="text-[#1a1a1a]" />
                    </div>
                  ) : isCheck ? (
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{ width: '18px', height: '18px', backgroundColor: '#1a1a1a' }}
                    >
                      <Check size={10} className="text-white" />
                    </div>
                  ) : (
                    <div
                      className="rounded-full"
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#e0e0e0',
                      }}
                    />
                  )}
                </div>

                {/* ── Right side (even months label, odd months empty) ── */}
                <div
                  className="flex-1 flex items-center"
                  style={{ justifyContent: 'flex-start', paddingLeft: '16px' }}
                >
                  {!isOdd && (
                    <div className="flex flex-col items-start">
                      {isReward && (
                        <div className="flex items-center gap-1">
                          <Lock size={11} className="text-[#C8102E]" />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#C8102E' }}>Free product!</span>
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: '12px',
                          color: isCheck ? '#1a1a1a' : '#888',
                          fontWeight: isReward || isCheck ? 600 : 400,
                        }}
                      >
                        {isCheck && '✓ '}Month {m}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Link */}
      <div className="mt-6 text-center">
        <button
          className="bg-transparent border-none cursor-pointer p-0 text-[#1a1a1a] hover:text-[#C8102E] transition-colors"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'underline',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onClick={() => {
            if (hasSubscription) {
              toast('Opening progress tracker...');
            } else {
              toast('Redirecting to subscriptions...');
            }
          }}
        >
          {hasSubscription ? <ET k="timeline.subCta" /> : <ET k="timeline.noSubCta" />}
        </button>
      </div>
    </div>
  );
}