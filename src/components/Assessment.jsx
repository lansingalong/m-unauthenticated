import { useState, useRef, useMemo, useEffect, useId } from 'react'
import { ASSESSMENTS } from '../data/questions'
import AssessmentHeader from './AssessmentHeader'
import SingleSelect from './survey/SingleSelect'
import MultiSelect from './survey/MultiSelect'
import TextField from './survey/TextField'
import CalendarSelector from './survey/CalendarSelector'
import SubQuestions from './survey/SubQuestions'
import { sfPro } from './survey/shared'
import { WellframeModal } from './WellframeModal'
import ConditionalGroup from './survey/ConditionalGroup'
import NestedQuestion from './survey/NestedQuestion'
import completionImg from '../assets/completion-illustration.png'

// Returns the 1-based page number of the first page with any unanswered question
function getResumePage(savedAnswers, pages) {
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].questions.some(q => savedAnswers[q.id] === undefined)) return i + 1
  }
  return pages.length
}

// Returns 0–100 for how many questions on a page are answered
function pageProgress(pageQuestions, answers) {
  const answered = pageQuestions.filter(q => answers[q.id] !== undefined).length
  return Math.round((answered / pageQuestions.length) * 100)
}

function scrollToQuestion(id) {
  const el = document.getElementById(`question-${id}`)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 20
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

function QuestionBlock({ q, answer, onAnswer, nextId, isReview = false, isLastOnLastPage = false }) {
  const suppressNext = isLastOnLastPage || isReview
  const handleSubmit = (val) => {
    onAnswer(q.id, val)
    if (!isReview && !isLastOnLastPage && nextId) {
      setTimeout(() => scrollToQuestion(nextId), 300)
    }
  }
  const sharedProps = { onSubmit: handleSubmit, required: q.required }

  const questionWithNum = `${q.number}. ${q.question}`

  switch (q.type) {
    case 'single':
      return <SingleSelect {...sharedProps} question={questionWithNum} options={q.options} answer={answer} hideSubmit={suppressNext} onSelect={suppressNext ? (val) => onAnswer(q.id, val) : undefined} />
    case 'multi':
      return <MultiSelect {...sharedProps} question={questionWithNum} options={q.options} answer={answer} hideSubmit={suppressNext} onSelect={suppressNext ? (val) => onAnswer(q.id, val) : undefined} />
    case 'text':
      return <TextField {...sharedProps} question={questionWithNum} answer={answer} hideSubmit={suppressNext} onSelect={suppressNext ? (val) => onAnswer(q.id, val) : undefined} />
    case 'calendar':
      return <CalendarSelector {...sharedProps} question={questionWithNum} answer={answer} hideSubmit={suppressNext} onSelect={suppressNext ? (val) => onAnswer(q.id, val) : undefined} />
    case 'sub':
      if (isReview) {
        return <SubQuestions {...sharedProps} question={questionWithNum} questions={q.subQuestions} answer={answer} />
      }
      return <SubQuestions {...sharedProps} question={questionWithNum} questions={q.subQuestions} answer={answer} />
    case 'conditional':
      if (isReview) {
        return <SingleSelect {...sharedProps} question={questionWithNum} options={q.options} answer={typeof answer === 'object' ? answer?.trigger : answer} hideSubmit={true} onSelect={(val) => onAnswer(q.id, { trigger: val, followUps: {} })} />
      }
      return <ConditionalGroup q={q} answer={answer} onSubmit={(val) => { onAnswer(q.id, val); }} nextId={nextId} />
    case 'nested':
      if (isReview) {
        return <SingleSelect {...sharedProps} question={questionWithNum} options={q.options} answer={typeof answer === 'object' ? answer?.trigger : answer} hideSubmit={true} onSelect={(val) => onAnswer(q.id, { trigger: val })} />
      }
      return <NestedQuestion q={q} answer={answer} onSubmit={(val) => onAnswer(q.id, val)} nextId={nextId} />
    default:
      return null
  }
}

function SuccessIllustration() {
  return (
    <svg viewBox="0 0 820 430" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 720, marginTop: 40 }}>
      <defs>
        <linearGradient id="arcPurple" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C8A8E8" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#C8A8E8" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="arcOrange" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5B87A" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#F5B87A" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="arcGreen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A8D878" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#A8D878" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="arcTeal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#70C8D8" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#70C8D8" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* ── Scattered teal squares ── */}
      <rect x="342" y="44"  width="13" height="13" fill="#0E98BE" opacity="0.85"/>
      <rect x="364" y="68"  width="18" height="18" fill="#0E98BE" opacity="0.7"/>
      <rect x="290" y="130" width="13" height="13" fill="#0E98BE" opacity="0.8"/>
      <rect x="432" y="54"  width="10" height="10" fill="#0E98BE" opacity="0.7"/>
      <rect x="268" y="350" width="14" height="14" fill="#0E98BE" opacity="0.8"/>
      <rect x="305" y="390" width="10" height="10" fill="#0E98BE" opacity="0.65"/>
      <rect x="500" y="38"  width="12" height="12" fill="#0E98BE" opacity="0.75"/>
      <rect x="520" y="168" width="15" height="15" fill="#0E98BE" opacity="0.7"/>
      <rect x="745" y="175" width="12" height="12" fill="#0E98BE" opacity="0.6"/>
      <rect x="762" y="295" width="16" height="16" fill="#0E98BE" opacity="0.5"/>

      {/* ── Rainbow arc bands ── */}
      <path d="M 215 415 C 360 255 530 230 700 315" stroke="url(#arcPurple)"  strokeWidth="80" strokeLinecap="round"/>
      <path d="M 222 385 C 368 225 538 205 705 290" stroke="url(#arcOrange)" strokeWidth="65" strokeLinecap="round"/>
      <path d="M 230 368 C 378 208 548 190 710 275" stroke="url(#arcGreen)"  strokeWidth="48" strokeLinecap="round"/>
      <path d="M 238 354 C 388 194 558 178 716 264" stroke="url(#arcTeal)"   strokeWidth="32" strokeLinecap="round"/>

      {/* ── Phone ── */}
      <rect x="574" y="82" width="138" height="242" rx="14" fill="#1B3A4A"/>
      <circle cx="643" cy="95"  r="5"  fill="#2D5A70"/>
      {/* tiles */}
      <rect x="588" y="110" width="55" height="50" rx="7" fill="#2A5E78"/>
      <rect x="648" y="110" width="50" height="50" rx="7" fill="#2A5E78"/>
      <rect x="588" y="165" width="55" height="50" rx="7" fill="#2A5E78"/>
      <rect x="648" y="165" width="50" height="50" rx="7" fill="#2A5E78"/>
      {/* text rows at bottom */}
      <rect x="588" y="222" width="110" height="7" rx="3" fill="#2A5E78"/>
      <rect x="588" y="234" width="82"  height="7" rx="3" fill="#2A5E78"/>
      <rect x="588" y="252" width="110" height="7" rx="3" fill="#2A5E78"/>
      <rect x="588" y="264" width="65"  height="7" rx="3" fill="#2A5E78"/>
      {/* EKG icon in tile 1 */}
      <path d="M594 136 L604 136 L608 125 L614 148 L619 132 L624 136 L634 136" stroke="#6DC8D8" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* text lines in tile 2 */}
      <rect x="652" y="122" width="36" height="4" rx="2" fill="#6DC8D8" opacity="0.7"/>
      <rect x="652" y="130" width="26" height="4" rx="2" fill="#6DC8D8" opacity="0.5"/>
      <rect x="652" y="138" width="32" height="4" rx="2" fill="#6DC8D8" opacity="0.5"/>
      {/* ? in tile 3 */}
      <text x="615" y="198" fontSize="26" fill="#6DC8D8" textAnchor="middle" fontFamily="Roboto, sans-serif" fontWeight="500">?</text>
      {/* shield in tile 4 */}
      <path d="M668 178 L680 182 L680 196 C680 203 668 207 668 207 C668 207 656 203 656 196 L656 182 Z" fill="#6DC8D8" opacity="0.7"/>
      <path d="M663 193 L667 197 L675 189" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* ── Person 1 — left, short, pink Wellframe shirt, arms raised ── */}
      {/* head */}
      <circle cx="264" cy="218" r="27" fill="#F4C5A3"/>
      {/* hair */}
      <path d="M242 212 Q248 192 274 196 Q282 206 276 202 Q266 192 252 195 Z" fill="#3A2010"/>
      {/* body */}
      <path d="M244 242 Q242 295 234 345 L294 345 Q288 295 286 242 Q275 250 264 250 Q253 250 244 242Z" fill="#E0509A"/>
      {/* left arm up */}
      <path d="M246 252 C232 230 220 210 210 198" stroke="#E0509A" strokeWidth="18" strokeLinecap="round"/>
      {/* right arm up */}
      <path d="M282 252 C298 232 310 214 318 200" stroke="#E0509A" strokeWidth="18" strokeLinecap="round"/>
      <circle cx="208" cy="195" r="11" fill="#F4C5A3"/>
      <circle cx="320" cy="197" r="11" fill="#F4C5A3"/>
      {/* legs */}
      <path d="M250 345 L244 420 L260 420 L264 368 L268 368 L272 420 L288 420 L282 345Z" fill="#2A7A9A"/>
      <ellipse cx="250" cy="422" rx="14" ry="6" fill="#1A2535"/>
      <ellipse cx="278" cy="422" rx="14" ry="6" fill="#1A2535"/>
      {/* Wellframe logo */}
      <circle cx="264" cy="288" r="15" fill="white" opacity="0.25"/>
      <path d="M257 288 L261 298 L264 290 L267 298 L271 288" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* ── Person 2 — middle, tall, purple, pointing right ── */}
      {/* head */}
      <circle cx="400" cy="200" r="29" fill="#F4C5A3"/>
      {/* hair */}
      <path d="M376 196 Q380 174 408 178 Q420 190 412 196 Q406 180 388 182 Z" fill="#2A1A0A"/>
      {/* glasses */}
      <circle cx="392" cy="200" r="9" fill="none" stroke="#5A3A1A" strokeWidth="2"/>
      <circle cx="410" cy="200" r="9" fill="none" stroke="#5A3A1A" strokeWidth="2"/>
      <line x1="401" y1="200" x2="401" y2="200" stroke="#5A3A1A" strokeWidth="2"/>
      {/* body */}
      <path d="M375 228 Q373 290 366 355 L434 355 Q430 290 428 228 Q414 238 400 238 Q386 238 375 228Z" fill="#A855C8"/>
      {/* right arm pointing at phone */}
      <path d="M424 242 C455 234 488 232 514 234" stroke="#A855C8" strokeWidth="18" strokeLinecap="round"/>
      <circle cx="516" cy="234" r="11" fill="#F4C5A3"/>
      {/* left arm */}
      <path d="M378 242 C366 258 360 272 356 282" stroke="#A855C8" strokeWidth="18" strokeLinecap="round"/>
      {/* legs */}
      <path d="M384 355 L376 435 L394 435 L398 378 L402 378 L406 435 L424 435 L416 355Z" fill="#2A3A5A"/>
      <ellipse cx="382" cy="437" rx="15" ry="6" fill="#CC3A30"/>
      <ellipse cx="419" cy="437" rx="15" ry="6" fill="#CC3A30"/>
      {/* Wellframe logo */}
      <circle cx="400" cy="300" r="16" fill="white" opacity="0.25"/>
      <path d="M393 300 L397 311 L400 302 L403 311 L407 300" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* ── Person 3 — right of phone, teal, arm reaching left ── */}
      {/* head */}
      <circle cx="778" cy="196" r="27" fill="#F4C5A3"/>
      {/* hair */}
      <path d="M756 192 Q762 170 796 174 Q808 186 800 192 Q794 176 768 178 Z" fill="#2A1008"/>
      {/* body */}
      <path d="M758 224 Q756 278 748 338 L808 338 Q804 278 800 224 Q789 234 778 234 Q767 234 758 224Z" fill="#1A9A88"/>
      {/* left arm reaching to phone */}
      <path d="M760 236 C740 242 722 248 712 252" stroke="#1A9A88" strokeWidth="18" strokeLinecap="round"/>
      <circle cx="710" cy="253" r="11" fill="#F4C5A3"/>
      {/* right arm */}
      <path d="M800 236 C815 252 820 264 822 276" stroke="#1A9A88" strokeWidth="18" strokeLinecap="round"/>
      {/* legs */}
      <path d="M764 338 L758 418 L776 418 L779 360 L781 360 L784 418 L800 418 L794 338Z" fill="#2A2A2A"/>
      <ellipse cx="764" cy="420" rx="14" ry="6" fill="#E08020"/>
      <ellipse cx="792" cy="420" rx="14" ry="6" fill="#E08020"/>

      {/* ── Floating health icons ── */}
      {/* Calendar (top-left area) */}
      <rect x="316" y="60" width="54" height="50" rx="6" fill="#EEEEF8"/>
      <rect x="316" y="60" width="54" height="15" rx="6" fill="#9898B8"/>
      <rect x="323" y="82" width="7" height="7" rx="1" fill="#9898B8" opacity="0.6"/>
      <rect x="336" y="82" width="7" height="7" rx="1" fill="#9898B8" opacity="0.6"/>
      <rect x="349" y="82" width="7" height="7" rx="1" fill="#9898B8" opacity="0.6"/>
      <rect x="323" y="94" width="7" height="7" rx="1" fill="#9898B8" opacity="0.6"/>
      <rect x="336" y="94" width="7" height="7" rx="1" fill="#9898B8" opacity="0.6"/>
      <circle cx="366" cy="66" r="8" fill="#9898B8" opacity="0.5"/>
      {/* Smartwatch */}
      <rect x="448" y="102" width="34" height="44" rx="10" fill="#2A2A3A"/>
      <rect x="453" y="80"  width="24" height="28" rx="5" fill="#3A3A4A"/>
      <path d="M454 118 L460 114 L465 122 L471 108 L476 118" stroke="#00C8A8" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <rect x="454" y="140" width="22" height="8"  rx="4" fill="#3A3A4A"/>
      {/* Blood glucose */}
      <rect x="506" y="112" width="44" height="58" rx="8" fill="#E8E8EE"/>
      <circle cx="528" cy="130" r="11" fill="#F5F5F8"/>
      <text x="527" y="134" fontSize="10" fill="#4488CC" textAnchor="middle" fontFamily="Roboto,sans-serif" fontWeight="700">135</text>
      <rect x="512" y="148" width="32" height="5" rx="2" fill="#CACAD8"/>
      <rect x="512" y="158" width="22" height="5" rx="2" fill="#CACAD8"/>
      {/* Heart + EKG */}
      <circle cx="614" cy="266" r="30" fill="#F84060" opacity="0.12"/>
      <path d="M590 268 L600 268 L606 254 L612 282 L618 262 L624 268 L638 268" stroke="#F84060" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      {/* Footsteps circle */}
      <circle cx="182" cy="334" r="32" fill="none" stroke="#CC44BB" strokeWidth="2.5" opacity="0.6"/>
      <ellipse cx="174" cy="336" rx="5" ry="8" fill="#CC44BB" opacity="0.7" transform="rotate(-15 174 336)"/>
      <ellipse cx="190" cy="330" rx="5" ry="8" fill="#CC44BB" opacity="0.7" transform="rotate(15 190 330)"/>
      {/* Rx bell */}
      <path d="M192 405 Q192 385 210 382 Q228 385 228 405 L228 415 L192 415 Z" fill="#F5A030"/>
      <text x="210" y="410" fontSize="13" fill="white" textAnchor="middle" fontFamily="Roboto,sans-serif" fontWeight="700">Rx</text>
      <circle cx="210" cy="418" r="5" fill="#F5A030"/>
    </svg>
  )
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function SkipModal({ type, open, onClose, onReview, onSubmit }) {
  const titleId = useId()
  const modalRef = useRef(null)
  const triggerRef = useRef(null)
  const isOptional = type === 'optional'

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      requestAnimationFrame(() => {
        const focusable = modalRef.current?.querySelectorAll(FOCUSABLE)
        focusable?.[0]?.focus()
      })
    } else {
      triggerRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = Array.from(modalRef.current?.querySelectorAll(FOCUSABLE) ?? [])
      if (!focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus() } }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      aria-hidden="true"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'var(--color-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--color-white)', borderRadius: 16, width: '100%', maxWidth: 420, padding: '28px 28px 32px', position: 'relative', boxShadow: '0 -4px 30px rgba(0,0,0,0.15)' }}
      >
        <button
          aria-label="Close dialog"
          onClick={onClose}
          style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 12, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4L16 16M16 4L4 16" stroke="var(--color-text-sub)" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <h2 id={titleId} style={{ fontFamily: sfPro, fontSize: 24, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 12px', lineHeight: 1.3 }}>
          {isOptional ? 'You Have Skipped Questions' : 'You Skipped Required Questions'}
        </h2>
        <p style={{ fontFamily: 'Roboto, system-ui, sans-serif', fontSize: 15, color: 'var(--color-text-sub)', margin: '0 0 28px', lineHeight: 1.6 }}>
          {isOptional
            ? 'Answering these questions helps us match care to you. Please complete these questions before submitting your assessment.'
            : 'You must complete these questions before submitting your assessment.'}
        </p>
        <button
          onClick={onReview}
          style={{ display: 'block', width: '100%', height: 52, background: 'var(--color-brand-accent)', color: 'var(--color-white)', border: 'none', borderRadius: 30, fontSize: 17, fontWeight: 500, fontFamily: sfPro, cursor: 'pointer', marginBottom: isOptional ? 16 : 0 }}
        >
          Finish Questions
        </button>
        {isOptional && onSubmit && (
          <button
            onClick={onSubmit}
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', fontSize: 16, fontWeight: 500, fontFamily: sfPro, color: 'var(--color-brand-accent)', cursor: 'pointer', padding: 8 }}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  )
}

function buildPartialQA(pages, answers) {
  const qa = []
  pages.forEach(page => {
    page.questions.forEach(q => {
      const answer = answers[q.id]
      if (answer === undefined) return

      if (q.type === 'single' || q.type === 'text') {
        qa.push({ q: q.question, option: String(answer), sub: '', score: 0 })
      } else if (q.type === 'calendar') {
        qa.push({ q: q.question, option: String(answer), sub: '', score: 0 })
      } else if (q.type === 'multi') {
        qa.push({ q: q.question, option: Array.isArray(answer) ? answer.join(', ') : String(answer), sub: '', score: 0 })
      } else if (q.type === 'conditional') {
        const trigger = typeof answer === 'object' ? (answer.trigger ?? '') : String(answer)
        qa.push({ q: q.question, option: String(trigger), sub: '', score: 0 })
        if (answer.followUps && q.followUps) {
          q.followUps.forEach(fq => {
            const fAnswer = answer.followUps[fq.id]
            if (fAnswer !== undefined) {
              qa.push({ q: fq.question, option: Array.isArray(fAnswer) ? fAnswer.join(', ') : String(fAnswer), sub: '', score: 0 })
            }
          })
        }
      } else if (q.type === 'nested') {
        const trigger = typeof answer === 'object' ? (answer.trigger ?? '') : String(answer)
        qa.push({ q: q.question, option: String(trigger), sub: '', score: 0 })
        if (answer.sub && q.subQuestions) {
          q.subQuestions.forEach(sq => {
            const sqAnswer = answer.sub[sq.id]
            if (sqAnswer !== undefined) {
              qa.push({ q: sq.question, option: Array.isArray(sqAnswer) ? sqAnswer.join(', ') : String(sqAnswer), sub: '', score: 0 })
            }
          })
        }
      } else if (q.type === 'sub') {
        if (q.subQuestions && typeof answer === 'object') {
          q.subQuestions.forEach(sq => {
            const sqAnswer = answer[sq.id]
            if (sqAnswer !== undefined) {
              qa.push({ q: sq.label || sq.question, option: String(sqAnswer), sub: '', score: 0 })
            }
          })
        }
      }
    })
  })
  return qa
}

const GC_URL = 'https://lansingalong.github.io/gc-assessmentscampaign/'

export default function Assessment({ firstName = '', lastName = '', dob = '', storageKey = '', assessmentType = 'Health Risk Assessment', onBackToEmail, onBackToLogin }) {
  const PAGES = ASSESSMENTS[assessmentType] ?? ASSESSMENTS['Health Risk Assessment']

  const [currentPage, setCurrentPage] = useState(() => {
    if (!storageKey) return 1
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey))
      if (!saved?.answers) return 1
      return getResumePage(saved.answers, PAGES)
    } catch { return 1 }
  })
  const [answers, setAnswers] = useState(() => {
    if (!storageKey) return {}
    try { return JSON.parse(localStorage.getItem(storageKey))?.answers ?? {} } catch { return {} }
  })
  const [submitted, setSubmitted] = useState(false)
  const [savedClosed, setSavedClosed] = useState(false)
  const [autosaveVisible, setAutosaveVisible] = useState(false)
  const autosaveHide = useRef(null)
  const [activeModal, setActiveModal] = useState(null) // 'saveClose' | 'submit'

  const totalPages = PAGES.length
  const page = PAGES[currentPage - 1]

  const allPageProgress = useMemo(
    () => PAGES.map(p => pageProgress(p.questions, answers)),
    [answers]
  )

  // Demo fill / clear
  useEffect(() => {
    const DEMO = {
      1:  'Good',
      2:  'About the same',
      3:  { trigger: 'No', followUps: {} },
      5:  'None',
      6:  'Yes',
      7:  ['None of the above'],
      8:  { trigger: 'None', followUps: {} },
      10: 'None.',
      11: '11/15/2025',
      12: 'No, nothing at this time',
      13: { trigger: 'No', sub: {} },
      14: '3–4 days',
      15: 'Mostly healthy with occasional processed foods',
      16: '7–8 hours',
      17: { trigger: 'Never used', followUps: {} },
      19: 'Never',
      20: 'No falls and no balance concerns',
      21: ['I do not need help with any of these'],
      22: 'Yes',
      23: 'No additional concerns.',
      24: 'No, and I do not feel I need to',
      25: { trigger: 'Not at all', followUps: {} },
      27: 'Not at all',
      28: 'Hardly ever',
      29: 'Yes',
      30: 'Never',
      31: 'No',
      32: ['No specific goals at this time'],
      33: 'No additional notes.',
    }
    const handleFill = () => setAnswers(DEMO)
    const handleClear = () => setAnswers({})
    window.addEventListener('demoFillAll', handleFill)
    window.addEventListener('demoClearAll', handleClear)
    return () => {
      window.removeEventListener('demoFillAll', handleFill)
      window.removeEventListener('demoClearAll', handleClear)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear autosave timer on unmount
  useEffect(() => () => clearTimeout(autosaveHide.current), [])

  // Signal GuidingCare that the assessment was completed
  useEffect(() => {
    if (submitted) {
      const fullQA = buildPartialQA(PAGES, answers)
      const payload = JSON.stringify({ assessmentType, qa: fullQA })
      localStorage.setItem('assessment-completed-qa', payload)
      if (storageKey) localStorage.setItem('assessment-completed-qa-' + storageKey, payload)
      if (storageKey) localStorage.removeItem('assessment-partial-qa-' + storageKey)
      if (storageKey) localStorage.removeItem('assessment-live-qa-' + storageKey)
      localStorage.removeItem('assessment-partial-qa')
      localStorage.setItem('hra-completed', 'jane-doe')
      localStorage.setItem('assessment-completed', assessmentType)
      localStorage.setItem('assessment-completed-ts', Date.now().toString())
      // Notify gc-assessments cwf.html via BroadcastChannel (same-origin, works across iframes)
      try {
        const bc = new BroadcastChannel('gc_assessment')
        bc.postMessage({ type: 'ASSESSMENT_COMPLETED', assessmentType })
        bc.close()
      } catch (_) {}
      if (window.opener) {
        try { window.opener.postMessage({ type: 'ASSESSMENT_COMPLETED', assessmentType }, '*') } catch (_) {}
      }
    }
  }, [submitted]) // eslint-disable-line react-hooks/exhaustive-deps

  // Signal GuidingCare that the assessment was saved (not yet submitted)
  useEffect(() => {
    if (savedClosed) {
      const partialQA = buildPartialQA(PAGES, answers)
      const payload = JSON.stringify({ assessmentType, qa: partialQA })
      localStorage.setItem('assessment-partial-qa', payload)
      if (storageKey) localStorage.setItem('assessment-partial-qa-' + storageKey, payload)
      if (storageKey) localStorage.removeItem('assessment-live-qa-' + storageKey)
      localStorage.setItem('assessment-saved', assessmentType)
      if (window.opener) {
        try { window.opener.postMessage({ type: 'ASSESSMENT_SAVED', assessmentType }, '*') } catch (_) {}
      }
    }
  }, [savedClosed]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist progress to localStorage whenever answers or page changes
  useEffect(() => {
    if (!storageKey) return
    localStorage.setItem(storageKey, JSON.stringify({ answers, currentPage }))
    const liveQA = buildPartialQA(PAGES, answers)
    if (liveQA.length > 0) {
      localStorage.setItem('assessment-live-qa-' + storageKey, JSON.stringify({ assessmentType, qa: liveQA }))
    }
  }, [answers, currentPage, storageKey])

  // On restore: scroll first unanswered question to top of viewport (just below sticky header)
  const isRestored = useRef(Object.keys(answers).length > 0)
  useEffect(() => {
    if (!isRestored.current) return
    const page = PAGES[currentPage - 1]
    const firstUnanswered = page?.questions.find(q => answers[q.id] === undefined)
    if (!firstUnanswered) return
    const id = setTimeout(() => {
      const el = document.getElementById(`question-${firstUnanswered.id}`)
      if (!el) return
      const headerEl = document.querySelector('header')
      const headerHeight = headerEl ? headerEl.offsetHeight : 0
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }, 150)
    return () => clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const advanceTimer = useRef(null)

  const setAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }))

    // Auto-advance to next page if this is the last question on the current page
    const lastQ = page.questions[page.questions.length - 1]
    if (lastQ && lastQ.id === qId && currentPage < totalPages) {
      clearTimeout(advanceTimer.current)
      advanceTimer.current = setTimeout(() => {
        setCurrentPage(currentPage + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 400)
    }

    clearTimeout(autosaveHide.current)
    setAutosaveVisible(true)
    autosaveHide.current = setTimeout(() => setAutosaveVisible(false), 2000)
  }

  // Check for skipped required and optional questions
  const { skippedRequired, skippedOptional } = useMemo(() => {
    let req = 0, opt = 0
    PAGES.forEach(p => p.questions.forEach(q => {
      if (answers[q.id] === undefined) {
        if (q.required) req++
        else opt++
      }
    }))
    return { skippedRequired: req, skippedOptional: opt }
  }, [answers])

  const [skipModal, setSkipModal] = useState(null) // 'required' | 'optional'
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [reviewList, setReviewList] = useState([]) // stable list captured on enter
  const [reviewSelections, setReviewSelections] = useState({}) // local selections before Next

  const enterReviewMode = () => {
    // Capture the unanswered list at this moment — it won't change as user selects
    const list = []
    PAGES.forEach((p, pi) => {
      p.questions.forEach(q => {
        if (answers[q.id] === undefined) {
          list.push({ ...q, pageIdx: pi, pageTitle: p.title, pageNum: pi + 1 })
        }
      })
    })
    setReviewList(list)
    setReviewSelections({})
    setSkipModal(null)
    setReviewMode(true)
    setReviewIdx(0)
    window.scrollTo(0, 0)
  }

  // Track selection locally — does NOT save to answers yet
  const handleReviewSelect = (qId, val) => {
    setReviewSelections(prev => ({ ...prev, [qId]: val }))
  }

  // Next button: commit the selection to answers, then advance
  const handleReviewNext = () => {
    const rq = reviewList[reviewIdx]
    if (rq && reviewSelections[rq.id] !== undefined) {
      setAnswers(prev => ({ ...prev, [rq.id]: reviewSelections[rq.id] }))
    }
    setReviewIdx(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = () => {
    // Merge any pending review selections into answers first
    const merged = { ...answers, ...reviewSelections }

    // Recount skipped with merged answers
    let reqSkipped = 0, optSkipped = 0
    PAGES.forEach(p => p.questions.forEach(q => {
      if (merged[q.id] === undefined) {
        if (q.required) reqSkipped++
        else optSkipped++
      }
    }))

    if (reqSkipped > 0) {
      // Commit review selections before showing modal
      if (Object.keys(reviewSelections).length > 0) {
        setAnswers(prev => ({ ...prev, ...reviewSelections }))
        setReviewSelections({})
      }
      setReviewMode(false)
      setSkipModal('required')
    } else if (optSkipped > 0) {
      if (Object.keys(reviewSelections).length > 0) {
        setAnswers(prev => ({ ...prev, ...reviewSelections }))
        setReviewSelections({})
      }
      setReviewMode(false)
      setSkipModal('optional')
    } else {
      // All answered — commit and submit
      if (Object.keys(reviewSelections).length > 0) {
        setAnswers(prev => ({ ...prev, ...reviewSelections }))
      }
      setReviewMode(false)
      if (storageKey) localStorage.removeItem(storageKey)
      setSubmitted(true)
      window.scrollTo(0, 0)
    }
  }

  const goNext = () => { if (currentPage < totalPages) { setCurrentPage(p => p + 1); window.scrollTo(0, 0) } }
  const goPrev = () => { if (currentPage > 1) { setCurrentPage(p => p - 1); window.scrollTo(0, 0) } }

  // When review finishes all questions, auto-submit
  useEffect(() => {
    if (reviewMode && reviewList.length > 0 && reviewIdx >= reviewList.length) {
      setReviewMode(false)
      setSubmitted(true)
      window.scrollTo(0, 0)
    }
  }, [reviewMode, reviewIdx, reviewList.length])

  if (reviewMode && reviewIdx < reviewList.length) {

    const rq = reviewList[reviewIdx]

    // Compute page progress for the header (uses live answers + current selections)
    const mergedAnswers = { ...answers, ...reviewSelections }
    const reviewPageProgress = PAGES.map(p => pageProgress(p.questions, mergedAnswers))

    return (
      <div className="min-h-screen bg-[#F2F8FA] flex flex-col">
        <AssessmentHeader
          currentPage={rq.pageNum}
          totalPages={totalPages}
          pageProgress={reviewPageProgress}
          onSaveAndClose={() => { setSavedClosed(true); setReviewMode(false); window.scrollTo(0, 0) }}
          onSubmit={() => { setReviewMode(false); handleSubmit() }}
          submitDisabled={false}
          autosaveVisible={autosaveVisible}
          onPageSelect={(pg) => {
            const idx = reviewList.findIndex(uq => uq.pageNum === pg)
            if (idx >= 0) { setReviewIdx(idx); window.scrollTo(0, 0) }
          }}
        />

        {/* Current question */}
        <div className="flex-1 py-8 px-4 flex flex-col items-center">
          <div className="w-full max-w-lg">
            <QuestionBlock
              key={`review-${rq.id}-${reviewIdx}`}
              q={rq}
              answer={reviewSelections[rq.id]}
              onAnswer={handleReviewSelect}
              nextId={null}
              isReview={true}
            />

            {/* Next button */}
            <button
              onClick={handleReviewNext}
              disabled={reviewSelections[rq.id] === undefined}
              aria-disabled={reviewSelections[rq.id] === undefined}
              style={{
                display: 'block',
                width: '100%',
                height: 52,
                marginTop: 24,
                background: reviewSelections[rq.id] !== undefined ? 'var(--color-brand-accent)' : 'var(--color-brand-disabled)',
                border: 'none',
                borderRadius: 30,
                fontSize: 17,
                fontWeight: 500,
                color: 'var(--color-white)',
                fontFamily: sfPro,
                cursor: reviewSelections[rq.id] !== undefined ? 'pointer' : 'not-allowed',
                letterSpacing: '-0.32px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (savedClosed) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingLeft: 24, paddingRight: 24 }}>
        <button
          onClick={() => { setSavedClosed(false); window.scrollTo(0, 0) }}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontFamily: sfPro, fontSize: 14, color: 'var(--color-text-sub)' }}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="var(--color-text-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, flexShrink: 0 }}>
          <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
            <path d="M2 10L9 17L24 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: sfPro, fontSize: 26, fontWeight: 700, color: 'var(--color-brand-accent)', textAlign: 'center', margin: '0 0 16px', maxWidth: 440, lineHeight: 1.3 }}>
          Your assessment has been saved<br />and closed.
        </h1>
        <p style={{ fontFamily: 'Roboto, system-ui, sans-serif', fontSize: 15, color: 'var(--color-text-mid)', textAlign: 'center', margin: '0 0 32px', maxWidth: 360, lineHeight: 1.7 }}>
          Your assessment is not yet complete, you can<br />return to finish it at any time.
        </p>
        <button
          onClick={onBackToLogin}
          style={{
            fontFamily: sfPro, fontSize: 15, fontWeight: 500,
            color: 'var(--color-text-mid)', background: 'var(--color-bg-second)',
            border: 'none', borderRadius: 30,
            height: 44, padding: '0 32px', cursor: 'pointer',
          }}
        >
          Back Home
        </button>

      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 40, paddingLeft: 24, paddingRight: 24 }}>

        {/* Back arrow */}
        <button
          onClick={() => { setSubmitted(false); setCurrentPage(totalPages); window.scrollTo(0, 0) }}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontFamily: sfPro, fontSize: 14, color: 'var(--color-text-sub)' }}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="var(--color-text-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>

        <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, flexShrink: 0 }}>
          <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
            <path d="M2 10L9 17L24 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 style={{ fontFamily: sfPro, fontSize: 26, fontWeight: 700, color: 'var(--color-brand-accent)', textAlign: 'center', margin: '0 0 16px', maxWidth: 440, lineHeight: 1.3 }}>
          Thank you for completing your<br />{assessmentType}!
        </h1>

        <p style={{ fontFamily: 'Roboto, system-ui, sans-serif', fontSize: 15, color: 'var(--color-text-mid)', textAlign: 'center', margin: 0, maxWidth: 360, lineHeight: 1.7 }}>
          Your responses have been recorded and will help<br />us better support your care and next steps.
        </p>


        {/* Illustration */}
        <img src={completionImg} alt="Assessment complete" style={{ width: '100%', maxWidth: 720, marginTop: 40 }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F8FA] flex flex-col">
      <AssessmentHeader
        currentPage={currentPage}
        totalPages={totalPages}
        pageProgress={allPageProgress}
        onSaveAndClose={() => { setSavedClosed(true); window.scrollTo(0, 0) }}
        onSubmit={() => handleSubmit()}
        submitDisabled={false}
        autosaveVisible={autosaveVisible}
        onPageSelect={(page) => { setCurrentPage(page); window.scrollTo(0, 0) }}
        onBackToEmail={onBackToEmail}
      />

      <div className="flex-1 py-8 px-4 flex flex-col items-center">
        <div className="w-full max-w-lg">

          {/* Welcome message */}
          {firstName && currentPage === 1 && (
            <p style={{ fontFamily: 'Roboto, system-ui, sans-serif', fontSize: 28, fontWeight: 500, marginBottom: 24, lineHeight: 1.2 }}>
              <span style={{ color: '#282F35' }}>Welcome, </span>
              <span style={{ color: '#0080A3' }}>{firstName}</span>
            </p>
          )}

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {page.questions.map((q, idx) => {
              const isLastOnLastPage = currentPage === totalPages && idx === page.questions.length - 1
              return (
                <div key={q.id} id={`question-${q.id}`}>
                  <QuestionBlock
                    q={q}
                    answer={answers[q.id]}
                    onAnswer={setAnswer}
                    nextId={page.questions[idx + 1]?.id}
                    isLastOnLastPage={isLastOnLastPage}
                  />
                </div>
              )
            })}
          </div>

          {/* Page navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, marginBottom: 16 }}>
            {currentPage === totalPages && (
              <button
                onClick={() => handleSubmit()}
                style={{
                  fontFamily: sfPro, fontSize: 16, fontWeight: 500,
                  color: 'var(--color-white)', background: 'var(--color-brand-accent)',
                  border: 'none', borderRadius: 30,
                  height: 51, flex: 1, letterSpacing: '-0.32px',
                  cursor: 'pointer',
                }}
              >
                Submit Assessment
              </button>
            )}
          </div>

          {/* Bottom spacer for scroll-to-top on last questions */}
          <div style={{ height: '100vh' }} />

        </div>
      </div>

      <SkipModal
        type="optional"
        open={skipModal === 'optional'}
        onClose={() => setSkipModal(null)}
        onReview={enterReviewMode}
        onSubmit={() => { setSkipModal(null); setSubmitted(true); window.scrollTo(0, 0) }}
      />

      <SkipModal
        type="required"
        open={skipModal === 'required'}
        onClose={() => setSkipModal(null)}
        onReview={enterReviewMode}
      />
    </div>
  )
}
