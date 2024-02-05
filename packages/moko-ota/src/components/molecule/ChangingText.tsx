import React, {useEffect, useState} from 'react';
import View from '../atomic/View';
import Text from '../atomic/Text';
import { styled } from '@kaidu/shared/lib/styles';

const StyledView = styled(View)`
  background-color: transparent;
`;

export default function ChangingText(props) {
  // A text component with changing trailing periods
  const {text, intervalTime = 1000} = props;
  const [index, setIndex] = useState(0);

  const displayedText = [
    text + '.',
    text + '..',
    text + '...',
    text + '....',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(index => (index + 1) % displayedText.length);
    }, intervalTime);

    // cleanup states
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <StyledView>
      <Text>{displayedText[index]}</Text>
    </StyledView>
  );
}
