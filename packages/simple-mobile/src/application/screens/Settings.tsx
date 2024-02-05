import React from 'react';
// import { View, Text } from '@kaidu/shared/components/atomic';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';
// import { ScreenWrapper } from '@kaidu/shared/components/headless/ScreenWrapper';
import { ReactNativeErrorBoundary } from '@kaidu/shared/domain/error-handling';
import { useNavigation } from '@react-navigation/native';
import { resetToHome } from '../navigation';
import { BasicListItem } from '@kaidu/shared/components/molecule/ListItem';
import { Linking } from 'react-native';
import { VersionText } from '@kaidu/shared/components/organism/VersionText';
import { VERSION } from '../../lib';

const handlePrivacyPolicy = () => {
  Linking.openURL('https://www.kaidu.ai/privacypolicy');
};

const handleFeedback = () => {
  Linking.openURL('https://www.kaidu.ai/contact');
};

/**
 * Screen for chaning App settings
 */
export function SettingsScreen(props) {
  const navigation = useNavigation();

  return (
    <ReactNativeErrorBoundary onReset={() => navigation.dispatch(resetToHome)}>
      <BasicTemplate>
        <BasicListItem
          title={'Privacy Policy'}
          onPress={handlePrivacyPolicy}
        // containerStyle={listItem?.containerStyle}
        // titleProps={{ style: listItem?.titleStyle }}
        />
        <BasicListItem
          title={'Send feedback'}
          onPress={handleFeedback}
        />
        <VersionText text={VERSION} />
      </BasicTemplate>
    </ReactNativeErrorBoundary>
  );
}
