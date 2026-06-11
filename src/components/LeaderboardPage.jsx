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
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 48px;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(15px, 1.45vw, 17px);
  font-weight: 800;
  color: #463C3C;
  background: rgba(255, 253, 248, 0.82);
  border: 1.5px solid rgba(133, 107, 107, 0.22);
  border-radius: 999px;
  padding: 0 20px 0 14px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(70, 60, 60, 0.08);
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    background 0.12s ease;

  &::before {
    content: '‹';
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f8e9c8;
    color: #856b6b;
    font-size: 24px;
    line-height: 1;
  }

  &:hover {
    background: #fffdf8;
    border-color: rgba(133, 107, 107, 0.42);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid rgba(255, 210, 127, 0.65);
    outline-offset: 3px;
  }
`

const NoticeOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(31, 26, 26, 0.44);
  backdrop-filter: blur(3px);
`

const NoticeDialog = styled.div`
  position: relative;
  width: min(100%, 420px);
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 34px 28px 28px;
  background:
    linear-gradient(180deg, #fffdf8 0%, #fff7e6 100%);
  border: 2.5px solid #856b6b;
  border-radius: 18px;
  box-shadow:
    0 7px 0 #e7d7bd,
    0 22px 44px rgba(31, 26, 26, 0.24);
  text-align: center;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;

  &::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 18px;
    right: 18px;
    height: 8px;
    border-top: 2px dashed rgba(133, 107, 107, 0.34);
  }
`

const NoticeBadge = styled.div`
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #ffa6a6;
  border: 2px solid #856b6b;
  color: #fffdf2;
  font-family: 'Suez One', Georgia, serif;
  font-size: 30px;
  line-height: 1;
  box-shadow: 0 5px 0 #d98080;
`

const NoticeTitle = styled.h2`
  margin: 0;
  color: #463c3c;
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1;
`

const NoticeText = styled.p`
  margin: 0;
  color: #856b6b;
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 900;
  word-break: keep-all;
`

const NoticeButton = styled.button`
  width: min(100%, 240px);
  min-height: 50px;
  border: none;
  border-radius: 12px;
  background: #463c3c;
  color: #fffdf2;
  font-family: inherit;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 5px 0 #241f1f;
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  &:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 #241f1f;
  }
`

function formatMs(ms) {
  if (!ms) return '0.00'
  return (ms / 1000).toFixed(2)
}

export default function LeaderboardPage({ rankings: fallback = [], onBack }) {
  const [rankings, setRankings] = useState(null)
  const [showNotice, setShowNotice] = useState(true)

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
        <BackButton type="button" onClick={onBack}>돌아가기</BackButton>
      )}
      {showNotice && (
        <NoticeOverlay>
          <NoticeDialog role="dialog" aria-modal="true" aria-label="랭킹 안내">
            <NoticeBadge>!</NoticeBadge>
            <NoticeTitle>RANKING</NoticeTitle>
            <NoticeText>솔로모드 점수만 등록됩니다.</NoticeText>
            <NoticeButton type="button" onClick={() => setShowNotice(false)}>
              확인
            </NoticeButton>
          </NoticeDialog>
        </NoticeOverlay>
      )}
      <LeaderboardPanel rankings={rankings ?? fallback} />
    </Page>
  )
}
