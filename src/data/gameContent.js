export const pageOrder = ['entry', 'mode', 'game', 'result', 'share']

export const pageMeta = {
  entry: { step: '01', title: '진입' },
  mode: { step: '02', title: '모드 선택' },
  game: { step: '03', title: '게임 진행' },
  result: { step: '04', title: '결과 확인' },
  share: { step: '05', title: '촬영 · 공유' },
}

export const modeContent = {
  solo: {
    label: '솔로 모드',
    title: '혼자 빠르게 10개의 표정을 클리어하는 흐름',
    description:
      '카메라와 Face Landmarker를 켠 뒤 랜덤 표정을 따라 하며 10라운드를 완료하면 기록이 저장됩니다.',
    details: [
      '총 10개의 랜덤 표정 제시',
      '성공 시 바로 다음 문제 이동',
      '종료 후 총 소요 시간과 리더보드 표시',
    ],
    challenge: '활짝 웃기',
    challengeNote: '일치율 92% 달성 시 다음 문제로 이동',
    resultPrimary: '총 소요 시간',
    resultPrimaryValue: '01:42.38',
    resultSecondary: '리더보드 등록',
    resultSecondaryValue: '#12 NEW',
  },
  multi: {
    label: '멀티 모드',
    title: '같은 공간에서 동시에 표정을 맞추는 2인 대결',
    description:
      '화면이 둘로 나뉘고 같은 표정이 제시되며, 먼저 성공한 플레이어가 점수를 가져갑니다.',
    details: [
      '좌우 2인 분할 화면 구성',
      '먼저 성공한 사용자 점수 획득',
      '3연승 시 랜덤 패널티 적용',
    ],
    challenge: '한쪽 눈 찡긋',
    challengeNote: '먼저 성공한 플레이어가 점수를 획득합니다',
    resultPrimary: '최종 점수',
    resultPrimaryValue: '8 : 6',
    resultSecondary: '승패 결과',
    resultSecondaryValue: 'WIN',
  },
}

export const captureCards = [
  '일치율이 가장 낮은 순간 자동 캡처',
  '망한샷과 베스트컷을 함께 저장',
  '게임 종료 후 4컷 프레임 자동 생성',
  'AR 필터 적용 사진까지 한 번에 제공',
]

export const guideMessages = [
  '카메라를 봐주세요!',
  '화면에 나오는 표정을 따라해주세요!',
  '상대방보다 빨리 따라할 경우, 점수가 추가됩니다!',
]

export const rankingData = [
  { rank: '01', name: 'PweeKing', score: '01:21.44' },
  { rank: '02', name: 'SmileCat', score: '01:28.10' },
  { rank: '03', name: 'FaceRush', score: '01:34.89' },
  { rank: '04', name: 'BlinkWin', score: '01:39.20' },
]
