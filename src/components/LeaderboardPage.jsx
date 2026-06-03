import { useEffect, useState } from 'react'
import styled from 'styled-components'
import LeaderboardPanel from './LeaderboardPanel'
import { fetchLeaderboard } from '../api/shareApi'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: clamp(36px, 4vw, 64px) clamp(24px, 4vw, 64px) 0;
  box-sizing: border-box;
  overflow: hidden;
`

const BackButton = styled.button`
  position: absolute;
  top: clamp(16px, 2.5vw, 28px);
  right: clamp(16px, 2.5vw, 28px);
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(13px, 1.4vw, 16px);
  color: #463C3C;
  background: #F8E9C8;
  border: 2px solid #856B6B;
  border-radius: 999px;
  padding: 8px 20px;
  cursor: pointer;
  z-index: 10;

  &:hover { background: #FFE9A8; }
`

function formatMs(ms) {
  if (!ms) return '00:00.00'
  const totalSec = ms / 1000
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0')
  const sec = (totalSec % 60).toFixed(2).padStart(5, '0')
  return `${min}:${sec}`
}

export default function LeaderboardPage({ rankings: fallback = [], onBack }) {
  const [rankings, setRankings] = useState(null)

  useEffect(() => {
    fetchLeaderboard(20)
      .then((res) => {
        const rows = (res.leaderboard ?? []).map((r, i) => ({
          rank: i + 1,
          name: r.username ?? r.user_id,
          time: formatMs(r.clear_time_ms),
        }))
        setRankings(rows)
      })
      .catch(() => setRankings(fallback))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Page>
      {onBack && (
        <BackButton type="button" onClick={onBack}>← 돌아가기</BackButton>
      )}
      <LeaderboardPanel rankings={rankings ?? fallback} />
    </Page>
  )
}
