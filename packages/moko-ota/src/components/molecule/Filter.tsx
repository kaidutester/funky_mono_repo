import React from 'react';
import {Switch} from 'react-native-elements';
import Text from '../atomic/Text';
import View from '../atomic/View';
import {updateFilter, selectFilter} from '../../lib/redux/deviceSlice';
import {useDispatch, useSelector} from 'react-redux';
import {selectIsUpdating} from '~/lib/redux/globalStatusSlice';
import { tailwind } from '@kaidu/shared/lib/styles';

export default function Filter(props) {
  // A filter input

  //states
  const {onChange} = props;
  const {onlyKaidu: isOnlyKaidu, onlyMoko: isOnlyMoko} =
    useSelector(selectFilter);
  const isUpdating = useSelector(selectIsUpdating);

  const dispatch = useDispatch();

  function handleValueChange(value) {
    dispatch(updateFilter({onlyKaidu: value, onlyMoko: !value}));
    onChange && onChange({onlyKaidu: value, onlyMoko: !value});
  }

  return (
    <>
      {isUpdating ? null : (
        <View style={tailwind('flex-row mb-6 items-center')} accessibilityLabel='Scanner Filter' >
          <Text style={tailwind('mr-2')} accessibilityLabel='Scanner Filter State'>{isOnlyKaidu ? 'Only Kaidu' : 'Only Moko'}</Text>
          <Switch
            value={isOnlyKaidu}
            onValueChange={value => handleValueChange(value)}

          />
        </View>
      )}
    </>
  );
}
