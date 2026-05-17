import styled from 'styled-components'
import LeaderboardPanel from './LeaderboardPanel'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: clamp(36px, 4vw, 64px) clamp(24px, 4vw, 64px) 0;
  box-sizing: border-box;
  overflow: hidden;
`

const RANKINGS = [
  { rank: 1,  name: '우지영', time: '00:10' },
  { rank: 2,  name: '김민수', time: '00:12' },
  { rank: 3,  name: '이서연', time: '00:15' },
  { rank: 4,  name: '박지호', time: '00:17' },
  { rank: 5,  name: '최예나', time: '00:20' },
  { rank: 6,  name: '정도윤', time: '00:22' },
  { rank: 7,  name: '조수아', time: '00:25' },
  { rank: 8,  name: '한지우', time: '00:28' },
  { rank: 9,  name: '서태민', time: '00:31' },
  { rank: 10, name: '윤하은', time: '00:34' },
]

export default function LeaderboardPage() {
  return (
    <Page>
      <LeaderboardPanel rankings={RANKINGS} />
    </Page>
  )
}
