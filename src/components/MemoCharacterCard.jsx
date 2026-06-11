import styled from 'styled-components'
import memoge from '../assets/memoge.svg'
import angryIcon from '../assets/expressions/angry.svg'
import eyebrowsUpIcon from '../assets/expressions/eyebrows_up.svg'
import happyIcon from '../assets/expressions/happy.svg'
import kissIcon from '../assets/expressions/kiss.svg'
import mouthOpenIcon from '../assets/expressions/mouth_open.svg'
import sadIcon from '../assets/expressions/sad.svg'
import squintIcon from '../assets/expressions/squint.svg'
import surprisedIcon from '../assets/expressions/surprised.svg'
import winkLeftIcon from '../assets/expressions/wink_left.svg'
import winkRightIcon from '../assets/expressions/wink_right.svg'

const expressionIconsByKey = {
  angry: angryIcon,
  eyebrows_up: eyebrowsUpIcon,
  happy: happyIcon,
  kiss: kissIcon,
  mouth_open: mouthOpenIcon,
  sad: sadIcon,
  squint: squintIcon,
  surprised: surprisedIcon,
  wink_left: winkRightIcon,
  wink_right: winkLeftIcon,
}

const expressionIconsByEmoji = {
  '😡': angryIcon,
  '🙆': eyebrowsUpIcon,
  '😄': happyIcon,
  '😘': kissIcon,
  '😮': mouthOpenIcon,
  '😢': sadIcon,
  '😑': squintIcon,
  '😲': surprisedIcon,
  '😉': winkLeftIcon,
}

const Wrap = styled.div`
  position: absolute;
  top: -68px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  pointer-events: none;
  width: clamp(160px, 20vw, 240px);
`

const Img = styled.img`
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 14px rgba(133, 107, 107, 0.2));
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 8px;
`

const Emoji = styled.span`
  font-size: clamp(44px, 8vw, 72px);
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
`

const ExpressionIcon = styled.img`
  display: block;
  width: clamp(64px, 9vw, 96px);
  height: clamp(64px, 9vw, 96px);
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
`

function getExpressionIcon(expression, emoji) {
  return expressionIconsByKey[expression?.key] ?? expressionIconsByEmoji[expression?.emoji ?? emoji]
}

export default function MemoCharacterCard({ emoji, expression }) {
  const iconSrc = getExpressionIcon(expression, emoji)
  const fallbackEmoji = expression?.emoji ?? emoji

  return (
    <Wrap>
      <Img src={memoge} alt="" />
      {(iconSrc || fallbackEmoji) && (
        <Overlay>
          {iconSrc ? (
            <ExpressionIcon src={iconSrc} alt={expression?.label ?? ''} />
          ) : (
            <Emoji>{fallbackEmoji}</Emoji>
          )}
        </Overlay>
      )}
    </Wrap>
  )
}
