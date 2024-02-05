import React from 'react';
import Text from '../atomic/Text';
import Label from '../atomic/Label';
import View from '../atomic/View';
import { styled } from '@kaidu/shared/lib/styles';
import { tailwind } from '@kaidu/shared/lib/styles';
import Icon from '~/components/atomic/Icon';

const ListItemLabel = styled(Label)`
  margin-bottom: 20px;
  margin-right: 24px;
  font-weight: bold;
  line-height: 24px;
`;

export default function KeyValuePair(props) {
  const {label, value, invalidValueText = 'No value found', ...rest} = props;

  return (
    <View style={tailwind('w-full flex-row py-3 px-5 bg-transparent')} {...rest}>
      <Text>
        <ListItemLabel
          style={tailwind('text-xl')}>{`${label}: `}</ListItemLabel>
        <Text style={tailwind(`text-xl text-justify`)}>
          {value ? value : invalidValueText}
        </Text>
        {value ? null : (
          <Icon
            name="warning"
            style={tailwind('ml-2')}
            type="fontawesome"
            color={'#e6c403'}
          />
        )}
      </Text>
    </View>
  );
}
