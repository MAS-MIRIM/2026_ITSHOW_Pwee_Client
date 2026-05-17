import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useGameSession } from '../context/gameSession'
import RoughFrame from './RoughFrame'
import sparkles from '../assets/sparkles.svg'

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  overflow: auto;
`

const Stage = styled.div`
  width: min(640px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(20px, 3vw, 32px);
  text-align: center;
  position: relative;
`

const SparkLeft = styled.img`
  position: absolute;
  width: clamp(64px, 9vw, 110px);
  top: -20px;
  left: -10px;
  animation: ${pulse} 2.2s ease-in-out infinite;
  pointer-events: none;
`

const SparkRight = styled.img`
  position: absolute;
  width: clamp(64px, 9vw, 110px);
  top: 40px;
  right: -10px;
  transform: scaleX(-1);
  animation: ${pulse} 2.6s ease-in-out infinite 0.4s;
  pointer-events: none;
`

const Badge = styled.div`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(12px, 1.4vw, 14px);
  color: #463C3C;
  background: #F8E9C8;
  border: 2px solid #C9A861;
  padding: 6px 18px;
  border-radius: 999px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
`

const Heading = styled.h1`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(48px, 7.5vw, 84px);
  color: #463C3C;
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1;
`

const Card = styled.div`
  position: relative;
  padding: clamp(32px, 4.5vw, 52px) clamp(36px, 6vw, 64px);
  background: #FFFAEB;
  width: 100%;
  box-sizing: border-box;
`

const Label = styled.span`
  font-family: Georgia, serif;
  color: #856B6B;
  font-size: clamp(13px, 1.6vw, 16px);
  letter-spacing: 0.24em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 10px;
`

const TimeBig = styled.div`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(60px, 10vw, 116px);
  color: #463C3C;
  font-variant-numeric: tabular-nums;
  line-height: 1;
`

const Note = styled.p`
  font-family: Georgia, serif;
  color: #856B6B;
  font-size: clamp(12px, 1.4vw, 14px);
  margin: 18px 0 0;
  opacity: 0.85;
`

const ScoreRow = styled.div`
  display: flex;
  justify-content: center;
  gap: clamp(28px, 6vw, 60px);
  align-items: baseline;
`

const ScoreCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  span.label {
    font-family: Georgia, serif;
    color: #856B6B;
    font-size: clamp(12px, 1.4vw, 14px);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  span.value {
    font-family: 'Suez One', Georgia, serif;
    font-size: clamp(56px, 9vw, 96px);
    color: #463C3C;
    line-height: 1;
  }
`

const VS = styled.span`
  font-family: 'Suez One', Georgia, serif;
  color: #D7A93B;
  font-size: clamp(28px, 4vw, 40px);
`

const CTA = styled.button`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(18px, 2.1vw, 22px);
  color: #FFFDF2;
  background: #463C3C;
  border: none;
  border-radius: 999px;
  padding: 16px 40px;
  cursor: pointer;
  box-shadow: 0 6px 0 #1F1717, 0 12px 20px rgba(70, 60, 60, 0.2);
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  &:hover { background: #2A2222; }
  &:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 #1F1717, 0 6px 10px rgba(70, 60, 60, 0.2);
  }
`

function formatTime(ms) {
  if (!ms || ms < 0) return '00:00.00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

export default function ResultPage() {
  const navigate = useNavigate()
  const { result } = useGameSession()
  const mode = result?.mode ?? 'solo'
  const leftScore = result?.score?.left ?? 0
  const rightScore = result?.score?.right ?? 0
  const winner = leftScore === rightScore ? 'draw' : leftScore > rightScore ? 'left' : 'right'

  return (
    <Page>
      <Stage>
        <SparkLeft src={sparkles} alt="" />
        <SparkRight src={sparkles} alt="" />

        <Badge>★ Clear ★</Badge>
        <Heading>{mode === 'multi' ? '대결 종료!' : '게임 종료!'}</Heading>

        <Card>
          <RoughFrame color="#856B6B" rx={28} seed={4} />
          {mode === 'solo' ? (
            <>
              <Label>Clear Time</Label>
              <TimeBig>{formatTime(result?.timeMs)}</TimeBig>
              <Note>리더보드에 등록되었습니다 (mock)</Note>
            </>
          ) : (
            <>
              <Label>Final Score</Label>
              <ScoreRow>
                <ScoreCell>
                  <span className="label">{winner === 'left' ? '★ P1' : 'P1'}</span>
                  <span className="value">{leftScore}</span>
                </ScoreCell>
                <VS>vs</VS>
                <ScoreCell>
                  <span className="label">{winner === 'right' ? '★ P2' : 'P2'}</span>
                  <span className="value">{rightScore}</span>
                </ScoreCell>
              </ScoreRow>
              <Note>{winner === 'draw' ? '무승부!' : `${winner === 'left' ? 'PLAYER 1' : 'PLAYER 2'} 승리!`}</Note>
            </>
          )}
        </Card>

        <CTA type="button" onClick={() => navigate('/photobooth')}>인생네컷 보기 →</CTA>
      </Stage>
    </Page>
  )
}
