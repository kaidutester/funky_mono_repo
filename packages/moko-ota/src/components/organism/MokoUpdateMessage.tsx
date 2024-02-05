import React from 'react';
import {View, Text} from 'react-native';
import ActivityIndicator from '../atomic/ActivityIndicator';
import ChangingText from '../molecule/ChangingText';
import {useDispatch} from 'react-redux';
import {setUpdating} from '../../lib/redux/globalStatusSlice';
import {CloseBtn} from '../molecule/CloseBtn';

export default function MokoUpdateMessage(props) {
  const dispatch = useDispatch();
  const handleCloseUpdate = () => {
    dispatch(setUpdating(false));
  };

  return (
    <ActivityIndicator text={'Loading'}>
      <View
        style={{
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ChangingText text={'Waiting for the upgrading result'} />
        <Text>You should see the blinking green light</Text>
        <Text>It usually takes around 2 minutes</Text>
        <Text>Close won't stop upgrading</Text>
        <CloseBtn onPress={handleCloseUpdate} />
      </View>
    </ActivityIndicator>
  );
}
